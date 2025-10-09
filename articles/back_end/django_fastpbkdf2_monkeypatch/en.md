# Monkeypatching fastpbkdf2 in a Django application

Ok, this is the first back-end post entry in my blog. Shame on me.

Anyway, I wanted it to be something original. Also related with Django,
which is my favorite web framework. This happened with me some long ago and
I found it interesting enough to be worth a blog post, but I've been since
procrastinating.

## The problem

Imagine you are in a startup and are about to launch the app you spent the last
year building after the seed round. Then, just before you go live, the recently joined
CTO ask you to perform a load test in the app to check how many concurrent users
it can support.

You are confident, because you build your app following best practices and Django,
which you have been told is product-ready and able to scale (IT'S EVEN USED BY
NASA!).

Being a pythonist, you choose [locust](https://locust.io/) to do the load testing,
and to build the script, you start with the first thing a user would do in your app,
the login.

Suppose you have a login endpoint like this:

```
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.contrib.auth.hashers import check_password
from django.utils import timezone
from .serializers import UserSerializer
from .models import User

class UserLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        login_email = request.data['email'].lower().strip()

        user_qs = User.objects.filter(email=login_email)
        if not user_qs:
            return Response({"error": True, "msg": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        user = user_qs.first()
        if check_password(request.data['password'], user.password):
            user.last_login = timezone.now()
            user.save(update_fields=['last_login'])
            data = UserSerializer(user).data
            return Response({"error": False, "data": data}, status=status.HTTP_200_OK)

        return Response({"error": True}, status=status.HTTP_403_FORBIDDEN)
```

I know, that setup is not so common. Probably best to use the builtin auth modules.
But this is really close to what we had back them at the time.
More common also would be returning a token or JWT, but this was done on the gateway.

Then you load some users with predefined deterministic password and run the locustfile:

```
import random
from locust import HttpUser, task, between

LOGIN_PATH = "/auth/login"
USER_PREFIX = "user"
USER_DOMAIN = "example.com"
IDX_MIN = 1
IDX_MAX = 100

def password_for(i: int) -> str:
    return f"VPass{i:03d}!Aa9"

class LoginUser(HttpUser):
    wait_time = between(1, 3)

    def on_start(self):
        i = random.randint(IDX_MIN, IDX_MAX)
        self.email = f"{USER_PREFIX}{i:03d}@{USER_DOMAIN}"
        self.password = password_for(i)

    @task(3)
    def login_ok(self):
        r = self.client.post(LOGIN_PATH, json={"email": self.email, "password": self.password})
        if r.status_code != 200 or not isinstance(r.json(), dict) or r.json().get("error") is not False:
            r.failure(f"Unexpected response: {r.status_code} {r.text}")
```

This setup can be found in this [repo](https://github.com/enricodvn/django-fastpbkdf2-monkeypatch).

Ok, so, before adding the other app use cases for the user, you run locust and get the following output:

![Locust Ouput No Monkeypatch](/articles/back_end/django_fastpbkdf2_monkeypatch/locust_output_no_monkeypatch.png)

Your hearth race and you start cold sweating as the number of users starts to pilling
and the requests per second starts to go up, until... 23 users. 23 USERS??

As you can see in the graph above, the requests go up until a threshold where it
saturates (that's the behavior for loadtesting). In this case it saturates in only
around 9 req/s. This saturation happens when your computer resources are depleted (100% CPU)
and the throttling begins, so you no longer have a linear relation between the number of users
and the req/s. But before that, the 99th percentile is already a lot deteriorated,
starting at around 23 users.

Then, in the following days, you spent your time desperately investigating and trying
to fix that, doubting yourself if you will be able to scale it.


## The cause

Well, I could not answer the CTO we were able to support only 23 users, so I did a
lot of things to deal with that, but first I ran a profiling with the
help of [werkzeug](https://werkzeug.palletsprojects.com/en/stable/middleware/profiler/).

One think I found out is that the most of the time the process was spent in the
hashlib lib's [pbkdf2_hmac](https://docs.python.org/3/library/hashlib.html#hashlib.pbkdf2_hmac) function.

That's because, by default, Django uses the PBKDF2 algorithm with a SHA256 hash, as you can
read [here](https://docs.djangoproject.com/en/5.2/topics/auth/passwords/#how-django-stores-passwords).

This algorithm is really CPU bound. So I started to find ways to improve this.

## The solution

I came by this [repo](https://github.com/ctz/fastpbkdf2) because of this [talk](https://jbp.io/2015/08/11/pbkdf2-performance-matters.html). But before I started implementing C bindings, I found there was already
a good implementation [here](https://github.com/Ayrx/python-fastpbkdf2).

It's also available on [pypi](https://pypi.org/project/fastpbkdf2/).

In the readme, it says that the interface is compatible with `hashlib.pbkdf2_hmac`.
Perfect! So I could just monkeypatch the function with this.

Monkeypatching in RoR is really easy, but in python and in a Django it's is not as
straightforward. Where should we do it? So the best place to do is in the gunicorn_config
file, where you can define the post_fork hook (if you are using gunicorn of course,
as recommended by Django for prod setup). This hook is called just after creating the
workers, just before running the application.

At the time we used gevent, so we already did the psycopg patching there. So we ended
up with the following code:

```
import multiprocessing, os
from psycogreen.gevent import patch_psycopg

bind = '0.0.0.0:8000'
workers = (multiprocessing.cpu_count()*2) + 1 if not int(os.environ.get("DJANGO_DEBUG", False)) else 8
worker_class = 'gevent'
worker_connections = 1000
timeout=120
loglevel = 'debug'

def post_fork(server, worker):
    patch_psycopg()

    #this mokeypatch hashlib.pbkdf2_hmac to a faster one
    from fastpbkdf2 import pbkdf2_hmac
    import hashlib
    hashlib.pbkdf2_hmac = pbkdf2_hmac

    worker.log.info("Sucessfully patched psycopg2 and hashlib")
```

After that, we ran the load test again and got the following result:

![Locust Ouput With Monkeypatch](/articles/back_end/django_fastpbkdf2_monkeypatch/locust_output_with_monkeypatch.png)

That is a lot better. The saturating happens around 20 req/s (more than double!).
Other than that, the server could handle 49 users before deteriorating, also more than
double that we got without the monkeypatch.

## Final discussion

Ok, of course 50 concurrent users is still not enough, and in the end I got fired.
*Just kidding*. But those results were obtained using a single computer running
both the server and the clients (check the repo). But this was pretty similar
results I got by the time, running against a dedicated server. I got a 100% improvement by
using this really simple solution. So I found it pretty interesting. Also have not found it anywhere,
that's why I figured I could write about that some day.

In this same episode, I got to check and try a lot of different types of workers
for gunicorn, and also did some tuning and experimentation on that (I might do a blog
post on that later).

Anyway, so the problem is that this endpoint is really CPU bound, and that's really not the
strength of python. But the user will hit this endpoint only once, and then it will be hitting
other endpoints that does not suffer from this problem. **So in the end the problem was really just the test**,
because it was not reproducing the behavior of a user (only of a DDoSer maybe).
When the other tasks were added to the locustfile to reproduce a user behavior, with the
login being called only once for each user, the loadtest results were much better, and
the app could handle much more users than I was stressing for.

That's why also we should always add protection against DDoS on login endpoints (like captcha, rate limit, etc).

In the end, to improve the results of the loadtest I also tuned the autoscaler on k8s. This way,
before the saturating we saw happens, more nodes and pods are added, and the load can continue growing
without deteriorating the service. It was a fun experience.

Finally, after some time we ended up switching to [keycloak](https://www.keycloak.org/) for auth management.
It uses the same algorithm to store the password, so migrating the users are really easy
and can be done without asking them to create a new password. I can do also do blog
post on that if there is interest.

### PS

During the creating of the setup to run the benchmarks on this post, I found some
difficulties installing [fastpbkdf2](https://pypi.org/project/fastpbkdf2/) with uv
for a newer version of python (3.12 with Django 5.2).
I did not had this problem because when I did this originally, I did for python 3.8
and Django 2.4.

Basically I run into [this issue](https://github.com/python-poetry/poetry/issues/6968)
but with uv instead of poetry. To fix this, I did a lot of things, you can check in
the [repo](https://github.com/enricodvn/django-fastpbkdf2-monkeypatch), I will also add
this discussion there. But one thing I did was trying to use [this](https://pypi.org/project/msfastpbkdf2/)
istead. It appears to be the same lib but built for newer python versions. It stills
keeps the interface. I tested it, and it worked for the simple test cases (only few iterations).
But for some reason, using it in the Django did NOT worked. The check_password function started
evaluation to False. So that's something to wonder as well. In the end I had to switch back
to the original one, and build it from the repo in the Dockerfile.

Also, I am not recommending to do that. It's just a discussion about something interesting. But
if you want to do it, first read the [django doc](https://docs.djangoproject.com/en/5.2/topics/auth/passwords/#how-django-stores-passwords), then you can create a custom hasher and add to `PASSWORD_HASHERS` in settings.py. It
would be something like this:

```
# myapp/hashers.py
from django.contrib.auth.hashers import PBKDF2PasswordHasher
from fastpbkdf2 import pbkdf2_hmac as fast_pbkdf2_hmac
import hashlib, base64

class FastPBKDF2SHA256PasswordHasher(PBKDF2PasswordHasher):
    algorithm = "pbkdf2_sha256"  # keep same tag
    def _pbkdf2(self, password, salt, iterations, dklen):
        if isinstance(password, str): password = password.encode()
        if isinstance(salt, str):     salt = salt.encode()
        dklen = dklen or hashlib.sha256().digest_size
        return fast_pbkdf2_hmac("sha256", password, salt, iterations, dklen)

```

```
# settings.py
PASSWORD_HASHERS = [
    "myapp.hashers.FastPBKDF2SHA256PasswordHasher",
    "django.contrib.auth.hashers.PBKDF2PasswordHasher",      # fallback
    "django.contrib.auth.hashers.Argon2PasswordHasher",
    "django.contrib.auth.hashers.BCryptSHA256PasswordHasher",
]
```

Also I tried a monkeypatch with [cryptography](https://pypi.org/project/cryptography/). Althouh
I had an improvement, it was not as nearly as good as the other one. But here it is also:

```
import hashlib as _hashlib
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives import hashes

_NAME_TO_HASH = {
    "sha1": hashes.SHA1, "sha224": hashes.SHA224, "sha256": hashes.SHA256,
    "sha384": hashes.SHA384, "sha512": hashes.SHA512,
}

def _pbkdf2_hmac_crypt(name, password, salt, iterations, dklen=None):
    if isinstance(password, str): password = password.encode()
    if isinstance(salt, str):     salt = salt.encode()
    algo = _NAME_TO_HASH[name.lower()]()
    length = dklen or algo.digest_size
    kdf = PBKDF2HMAC(algorithm=algo, length=length, salt=salt, iterations=int(iterations))
    return kdf.derive(password)

import hashlib
hashlib.pbkdf2_hmac = _pbkdf2_hmac_crypt
```

If you found this interesting, I encourage you to clone the [repo](https://github.com/enricodvn/django-fastpbkdf2-monkeypatch)
and try it youself.
It has a docker-compose file so it's really easy to run.
