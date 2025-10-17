# How this blog is built

In a past blog post I said I would comment my choices to design this blog.
So here it is, better late than sorry.

## Back in my times...

Well, I come from a time where every website were static. They were build purely
in html and served with a webserver like apache. But to serve those static files
you would have to pay for a hosting company anyway.

When I was about a teenager, there was a free hosting company in Brazil called
[HpG](https://www.reddit.com/r/Nostalgia_Br/comments/1ja2rs6/hpg/) (HomePage Gratis -
Translates to Free HomePage). They offered 10mb of free hosting where you
could upload your files (using FTP) and then served using their own webserver
(should be apache). Then you could access your site in, ie, `drugo.hpg.org`.

There was also cjb, which was a free DNS redirector. I did not like hgp domain,
so we used it to become `drugo.cjb.net`.

Anyway I wasn't supposed to use any of those because I was a minor, but we created
some websites for fun, me and my brother. We mostly used *Microsoft Frontpage* for that.

But after the **.com bubble burst**, free hosting became somewhat rare.

I always wanted to host a personal website, but I had not so much things to talk about
and so there was no point in paying for hosting...

Fast forward some decades, and I heard about github pages. Tbh, there was some new ways to host
free websites already, like cloudflare. But I found gh pages pretty interesting.

At the time they recommended to use [Jekyll](https://jekyllrb.com/docs/github-pages/), which brings me to...

## Static Site Generators

SSGs are softwares that generate html websites from text inputs, like markdown files.

It creates the whole website just from the content (text, markdown) and the layout files
(those use some kind of templating language, like Jinja).
It is pretty cool. Those static generated sites has some advantages. They
can support a lot of traffic, since they are directly served by the webserver, which
is build to handle a lot of connections already. Also they are easy indexed by the robots,
good for SEO.

Jekyll is built with Ruby, so I had to learn it before using it, so it was enough to
keep me procrastinating for a while.

I later came along [Pelican](https://getpelican.com/). It's on python, so I had
no more excuse. It's is also pretty darn cool. But after a little bit playing with it,
I also found [hugo](https://getpelican.com/). It is built with go lang, and it is pretty
fast, aimed to performance. I also always wanted to learn Go...

Anyway, the disadvantage of SSG is that the resulting websites are not so interactive
by default, which brings me to [Gatsby](https://www.gatsbyjs.com/).

Gatsby is, again, a SSG in JS, but it also supports SSR, which is pretty cool.
It supports [markdown](https://www.gatsbyjs.com/docs/how-to/routing/adding-markdown-pages/),
and is built with react. So the end result are websites that are really interactive.
About that same time `next.js` was also released. There was also
some free hosting alternatives for them already, like vercel and cloudflare workers.

So why in the end I ended up with an SPA?

## Keeping it simple

Well, based on the discussion above, it would make more sense to use SSG. It's
static, could be hosted on gh-pages, and is good for SEO. Also if you want something
more modern and interactive, you can use Gatsby.

In the end, I just wanted something that render the content in markdown, so I can
change the engine later if I want, without having to touch in the actual text
content. I want it to be interactive as well, and wanted to deploy to gh-pages.

**But I also wanted full control on the design**, and to do that using the other tools I
would take some time to learn the template system, layouts, etc.

By the time I was pretty comfortable with react, and came along a real gem called
[react-markdown](https://www.npmjs.com/package/react-markdown).
So instead of having to learn how to use gatsby or the template languages used by the other SSGs,
I wondered, why don't I just use it and make a simple SPA around it?

And that was what I did. This app is composed by just three pages, and the most important
one is the article page that wraps around `react-markdown`.

The app structure looks like this:

```
public/
  articles/
    category_slug/
      en.md
      article_slug/
        en.md
src/
  pages/
    article.tsx
    category.tsx
  App.tsx
  ...
```

The public folder is copied to the final build, so all markdown files are shipped raw
together with the bundle. I structured it in a hierarchic way. First we have the root
articles folder. It contains folders that are the categories. In each of those category
folders, we have a `en.md` markdown file, that will be used to render the category page,
which acts as a index for the category's articles. Then we have the article as a folder
with a slug name, and inside it the `en.md`, which actually contains the article written in markdown.
As you can guess, I did this way to support multiple translations later (I would add `pt.md`
as well but have not done it yet).

Then the article page is responsible for rendering the markdown using `react-markdown`:

```
function Article() {

  const { article, category } = useParams();

  const [articleMd, setArticleMd] = useState('');

  useEffect(() => {
    fetch(`/articles/${category}/${article}/en.md`)
      .then(res => res.text())
      .then(res => setArticleMd(res));
  });

  return (
    <div className="content">
      <ReactMarkdown children={articleMd} />
    </div>
  )
}
```

As you can see, it fetches the markdown and then renders the article using the
`ReactMarkdown` component. This way the markdown is only loaded when needed, and it
gets the article and category slugs from the path params.

There's also the category page, that works as the index for the articles on that
category:

```
function Category() {

  const { category } = useParams();

  const [categoryMd, setCategoryMd] = useState('');

  useEffect(() => {
    fetch(`/articles/${category}/en.md`)
      .then(res => res.text())
      .then(res => setCategoryMd(res));
  });

  return (
    <div className="content">
      <ReactMarkdown
      components={ {
        a: ({node, ...props}) => <Link to={props.href} {...props} />
      } }
      children={categoryMd} />
    </div>
  )
}
```

The most important thing here is the capacity of the `ReactMarkdown` to receive
a components prop. This allow us to change the way a component would be rendered.
So in our case, for `a` tags (links), we overwrite the default behavior to render
a Link component in react.
(I had to slightly change it later due to some changes in the lib types).

For the article `en.md` page, we would have to do something like this:

```
# Category name

Some description of the category.

## [Article title](/articles/category_slug/article_slug)
#### *by Drugo at 2025/01/01*
Some description of the article
```

So when someone clicks on the article title, it is now rendering a Link component
which will route to the article pages, that will fectch the markdown based on the
slugs we added the the path params. Cool right?

The app is then just a `HashRouter` (as discussed before) that wraps it all:

```
function App() {

  return (
    <HashRouter>
      <header className="navbar nav">
        <nav aria-label="Site sections" className="mobile-hidden">
          <ul role="list">
            <li>
              <div className="dropdown">
                <a href="#">Articles</a>
                <div className="dropdown-child">
                  <Link to="/articles/category_slug1">Category Name 1</Link>
                  <Link to="/articles/category_slug2">Category Name 2</Link>
                  ...
                </div>
              </div>
            </li>
          </ul>
        </nav>
        ...
      </header>
      <div className="content">
        <Routes>
          <Route path="/articles/:category/:article/" element={<Article />} />
          <Route path="/articles/:category/" element={<Category />} />
        </Routes>
      </div>
    </HashRouter>
  )
}
```

It just adds the routes and links to the categories, based on the discussed schema.

## Future changes

It's been 2 years now that this website is live. I am now planning a overhaul of it.
In the next weeks (hopefully) I plan to add:

- **Comments**: I always planned to add comments, but that would require a backend. But
there are some comment widgets providers out there. I was going to use [disquis](https://disqus.com/),
but I heard they recently added ads... So you can wonder the happiness in my face when
I found about [utteranc](https://utteranc.es/).
- **Style**: I started this blog using [missing.css](https://missing.style/) for styling
because of the minimalistic design. But I don't know, I want to do some changes on the
styling, I am not happy about it yet, so I might change that as well.
- **TUI**: I also plan to add a text interface. Since the articles are rendered on the fly,
that would be pretty simple. If I was using a SSG, that would be more hard to do.
- **Image widget**: I want to add a image widget and the way I an showing images currently
on the markdown files.
- **Improvements on SEO**: I need to add improvements to SEO so this could actually reach
someone (lol). This includes, for instance, a sitemap.
- **Postprocessing step and more**: I want to add a postprocessing step, that would help to create
the sitemap, for instance. Then I could also add some other content (maybe hidden), that
would not be in the repo. I could add a search functionality as well, so I would build the index
and bundle it together. Maybe this posprocessing could also build the article tree in some
json structure, so I could create a new category page with paginations. Dunno.

## Just keep building!

Anyway, this post is already becoming too big. Keep coming back to see the changes.

In the end, this website was only possible because of the great work from the folks
of [react-markdown](https://www.npmjs.com/package/react-markdown). When I first saw it,
I thought: "Wow I can really build a nice blog around it". And that's what I did.

I really liked the end result, as the articles are served raw in markdown. You can
also read the articles directly in the github repo as well, something I was planning
by design. And if I want to migrate later to a SSG, that would be something not so hard
to do.

I also encourage you to build your own personal website! If you like, you can
clone this one and use it as a base! You can find the repo [here](https://github.com/enricodvn/drugo-website/).

In the end, for a blog hosted on gh-pages, I think the easist way is using one of those SSG tools
I discussed, but if you want more control, like me, just build your own by scratch, there are endless
possibilities, just keep building!
