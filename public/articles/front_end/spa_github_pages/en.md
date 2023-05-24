# Hosting a React SPA in Github Pages

This blog is a React SPA hosted in [github pages](https://pages.github.com/).
At least for now (I don't know about it in the future).

In this post I will talk about how I did it. It is not a tutorial, but rather
comments on what worked out easily and on where did I find some troubles.

## Github Pages

Github pages is a really good place to host personal websites like blogs because,
well, it's free.

At first it didn't make sense to me why someone would offer free hosting. But it
makes perfectly sense. First, github was already made to host and serve static
files for free. Second, with AI and it's generative tools, like co-pilot, it is
really interesting to Microsoft (curent owner) the more websites and it's code
to be hosted there.

Anyway, it has some [limitations](https://docs.github.com/en/pages/getting-started-with-github-pages/about-github-pages#usage-limits). It currently offers 1GB in storage and 100 GB for
month in bandwidth. But it is really more than enough, and I doubt I will have to
worry about it for now.

Now, being able to host only static files, it means you can host two kinds of
websites in gh-pages: static-site generated (SSG) and single page apps (SPA).

I will talk about them in more depth later, but SSG are a bunch of html that are
generated from templates and some markdown content (like readthedocs documentations),
and SPA are (mostly) a bunch (or one) JS files that renders the content dynamically
in a single html page with Javascript.

I will talk about why I chose it later, but since I already made a post talking
about the marvels of React, I decided to go with SPA on this framework.

## Using React and Vite

With that in mind, what was the first thing I did? Of course, google React SPA in
github pages. Those were the top results:

- [How to publish a single page application at no cost with GitHub Pages (React, Svelte, etc)](https://levelup.gitconnected.com/how-to-publish-a-single-page-application-at-no-cost-with-github-pages-react-svelte-etc-897b8f75a22b)
- [Deploying React apps to GitHub Pages](https://blog.logrocket.com/deploying-react-apps-github-pages/)

I really like the logrocket posts. Everything you want to do with React, chances
are they have an article for it, and good SEO too.

Anyways, since I wanted to use the most recent and recommended versions, I opted
to use [vite](https://vitejs.dev/) instead of the `create-react-app` tool.

Since I use `yarn`, I created the project with the command:

```
yarn create vite drugo-website --template react-ts
```

And chose the `react-ts` template. After that I installed the
[gh-pages](https://www.npmjs.com/package/gh-pages) npm module. All it does is bundle
your build folder in a branch called `gh-pages`, which will be used by github to
serve the static files. It also gives you a command that doest that under the hood.

The vite command already create the `.gitignore` file, so just enter the folder, do
`git add .`, adds the origin and you can make your [initial commit](https://github.com/enricodvn/drugo-website/commit/e50279aa4faacb7bcc69e5fc2b78863754c8712c).

After tweaking the style and content (using as backbone) of the default vite
landpage, and adding the scripts to build and deploy, I ended with [this](https://github.com/enricodvn/drugo-website/tree/7a4672189245d550c3f703b1f8b46d961f337012) project structure. And the
scripts in the [package.json](https://github.com/enricodvn/drugo-website/blob/7a4672189245d550c3f703b1f8b46d961f337012/package.json) file:

```
"scripts": {
  "dev": "vite",
  "build": "tsc && vite build",
  "deploy": "gh-pages -d dist",
  "lint": "eslint src --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
  "preview": "vite preview"
}
```

As you can guess, I call the `yarn build` command, and vite will compile and build
the bundle in the `dist` folder. After that I just run `yarn deploy` and voilá,
the site is online.

This first version was just a landing page with link to my social medias.

```
import drugoLogo from './assets/drugo.jpg'
import twitterLogo from './assets/twitter.svg'
import linkedinLogo from './assets/linkedin.svg'
import unsplashLogo from './assets/unsplash.svg'
import githubLogo from './assets/github.svg'
import './App.css'

function App() {

  return (
    <>
      <div>
      <a href="">
        <img src={drugoLogo} className="roundlogo" alt="Drugo logo" />
      </a>
      <h2> Hi! My name is Enrico but people call me Drugo. </h2>

      <h2> Welcome to my personal website! </h2>

      <p>Will be blog posting soon...
      but in the meantime follow me on the social media:</p>
      <p>
      <a href="https://twitter.com/EnricoDVN" target="_blank">
        <img src={twitterLogo} className="logo medialogo" alt="Twitter logo" />
      </a>
      <a href="https://br.linkedin.com/in/enrico-davini-neto" target="_blank">
        <img src={linkedinLogo} className="logo medialogo" alt="LinkedIn logo" />
      </a>
      <a href="https://unsplash.com/@enricodvn" target="_blank">
        <img src={unsplashLogo} className="logo medialogo" alt="Unsplash logo" />
      </a>
      <a href="https://github.com/enricodvn" target="_blank">
        <img src={githubLogo} className="logo medialogo" alt="Github logo" />
      </a>
      </p>
      </div>
    </>
  )
}

export default App
```

It looked like this:

![First blog version looks](/articles/front_end/spa_github_pages/first_blog_version.png)


But after I did this and entered the url [https://enricodvn.github.io/drugo-website](https://enricodvn.github.io/drugo-website),
I was greeted with: *nothing*. Just a blank page. The problem was that, although
the `index.html` was loaded correctly, I was getting 404 for all the other assets,
like mostly important, the `index.js` file that in fact contains the app.

And that happens because vite bundles all the assets in an location called `assets`.
When you access the `index.html`, it then tries to fetch them in
`https://enricodvn.github.io/assets/` location, which of course don't exists, because
it is missing the `drugo-website` portion.

This was the first problem I encountered, and to solve this just adds the base
parameter in the `vite.config.ts` file, like that:

```
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/drugo-website/'
})
```

Go figure... reading the [docs](https://vitejs.dev/guide/static-deploy.html#github-pages)
is actually useful.

After the deploy command, there it was, working like a charm! But it was not in
the domain I wanted. You can add a custom domain too, by configuring the DNS
and adding a CNAME file.

## Custom domain with GoDaddy

I bought this domain (drugo.io) in GoDaddy, so the first step was to configure the
DNS. To do that, first verify the domain in your profile settings, so github knows
the domain is actually yours.

To do that, go to [https://github.com/settings/pages](https://github.com/settings/pages) and
click in the button `Add a domain`. Provide the domain and click in `Add domain`:

![Add verified domain in github panel](/articles/front_end/spa_github_pages/add_verified_domain1.png)

Then, copy the name and code of the TXT record:

![Add verified domain in github panel](/articles/front_end/spa_github_pages/add_verified_domain2.png)

Now adds the TXT type domain in the GoDaddy DNS control panel for the domain, on
[https://dcc.godaddy.com/control/YOUR_DOMAIN/dns](#). Use the name and value provided
in the last step.

![Configure the domain in GoDaddy panel](/articles/front_end/spa_github_pages/configure_domain.png)

As you can see above, I also added an A record with the value `185.199.108.153`
and a CNAME record with the name `www` and value `enricodvn.github.io`. This IP
is from github, and there is a [list](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site#configuring-an-apex-domain)
with all the available IPs.

Now go back to the github pages setting for you custom domain and click on `Verify`.
And after some time, you can see the domain listed as verified:

![Verify domain in github panel](/articles/front_end/spa_github_pages/add_verified_domain3.png)

Finally, go to the pages config in your project repository, ex [https://github.com/enricodvn/drugo-website/settings/pages](https://github.com/enricodvn/drugo-website/settings/pages).
There, in the `Custom domain` section, input your domain and save. All this does
is create a CNAME file in the root of the chosen branch with the domain in it (
you could also do it manually).

![Add verified domain in repository config](/articles/front_end/spa_github_pages/add_verified_domain4.png)

There you go!

Two last things: first, don't forget to [remove the base config](https://github.com/enricodvn/drugo-website/commit/6934cfcd8ef307acc4e86f77ebf6807f54e3b3a9) from vite if you
did add like I told above, because it won't be necessary anymore (it will point to
the wrong location); second, change the deploy script to re-create the CNAME before
deploying, because everytime it is run, it overwrite the folder and removes the CNAME
file, and the domain will not work anymore, and you will have to configure again
on every deploy. I also found this fix in the [docs](https://github.com/tschaub/gh-pages#deploying-to-github-pages-with-custom-domain), and the script should looks
like [this](https://github.com/enricodvn/drugo-website/commit/a9a0e3467d6f92e0905d4776c9d70b5006bffccd):

```
"deploy": "echo drugo.io > ./dist/CNAME && gh-pages -d dist",
```

## Handling 404s

After you add navigation to you SPA, things might get complicated.

First, `BrowserRouter` won't work, because every time you click a link, it will
refresh and give a 404 from github. This error is nasty because it won't happen
in your local development ambient.

If the files were being server with nginx, this would be easly resolved by
adding the following in the conf file:

```        
  # where the root here
  root /var/www/build/;
  # what file to server as index
  index index.html;

  location / {
      # First attempt to serve request as file, then
      # as directory, then fall back to redirecting to index.html
      try_files $uri /index.html;

  }
```

In the above config, all `uri` would be handled by index.html.

Since we don't have a nginx, the solution is to use `HashRouter`. But there is still
a problem, if someone tries to access using a link, ex, for an article, it will
still return 404! This is really bad for a blog...

After some research, I found [this](https://spa-github-pages.rafgraph.dev/). It
is a really elegant solution to this problem. You can read in the [docs](https://github.com/rafgraph/spa-github-pages#readme) to find out more, but basically it uses a custom `404.html` page
that redirects to the index.html with the correct url in the browser's history.
This way the router will work correctly. Kudos to the author!


## Conclusion

That's how I hosted this blog in Github pages! I hope this helps you if you decide
to do the same.

The source code of this blog is open and you can check it on [github](https://github.com/enricodvn/drugo-website).
Feel free to fork and use it as base, and if you like it, also give it a star!
