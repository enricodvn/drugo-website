# Why react?

It is a little ironic that my first technical post in this blog is about front end,
since in my career I have focused more in back end development.

But I really want to make this post to prove that I find the recent developments
in front end libs and frameworks really important and usefull, and to be honest,
I actually like javascript.

I think I need to prove it because there is this constant dispute between front
and backend developers (at least where I worked there was). I remember in the talk
of Adrian Holovaty (you can watch it [here](https://www.youtube.com/watch?v=k7n2xnOiWI8)),
in which he ironically advocate against frameworks, he jokes that front end developers created
them to remind us they are computer scientist as well.

But it's all a joke, and in this post I will show their usefulness.

## In the early days...

When Javascript was launch, it was really messy times, because each browser
implemented their own API.

Then came a fantastic lib called jQuery. It was a middleware between their API
and many supported browser APIs, so developers could just focus on one interface.
And it was a great interface. I really liked it, and it had a great impact in mine
and many others developer experience.

But later, standardization happened, and jQuery lost many of their advantages.
Anyways, the JS and jQuery revolutions brought interactive websites. What that
means is that the browser did not have to refresh the pages on navigation. That
came with a lot of benefits, as less network usage, since only new data could
be fetched instead of the same HTML all over again. And it had animations too!

But that meant that the browser DOM had to be manipulated by the JS APIs, and
because of the above discussion, oh boy, it was far from being standardized, and
everyone did it their own way.

## The spaghetti code

Here is an example on what I am talking about, and it was from a dynamic table
on a legacy management system I worked on:

```
function show_lines ( data ) {
  passenger = data[7];
  line_passengers = passenger.line_passengers;

  let html = `
      <table class="table table-condensed table-bordered " cellspacing="0">
          <thead>
          <tr>
              <th>Linha</th>
              <th>Trajeto</th>
              <th>Assento</th>
              <th>Valor base</th>
          </tr>
          </thead>
          <tfoot>
          <tr>
              <th>Linha</th>
              <th>Trajeto</th>
              <th>Assento</th>
              <th>Valor base</th>
          </tr>
          </tfoot>
          <tbody>
      `;
  $.each(line_passengers, function(index, line_passenger){
    html+='<tr>';
    //linha
    html+='<td>';
    html+=line_passenger.line.name;
    html+='</td>';
    //trajeto
    html+='<td>';
    if (line_passenger.way == 1)
      html+='<span style="display: inline-block;width: 60px;" class="label label-primary">Ida</span>';
    else if (line_passenger.way == 2)
      html+='<span style="display: inline-block;width: 60px;" class="label label-warning">Volta</span>';
    else
      html+='<span class="label label-success">Ida e Volta</span>';
    html+='</td>';

    //preço
    html+='<td>';
    html+=line_passenger.contract.value;
    html+='</td>';

    html+='</tr>';
  });
  html += `
          </tbody>
      </table>
      `;
  return html;
}
```

What that function did was basically receive data (that was fetched from server)
and return an htlm, witch could later be rendered with jQuery with a
[html(htmlString)](http://api.jquery.com/html/#html2) call, like that:


```
var data = fetch_data(); //some ajax server call
var table_div = $("#table-div");
table_div.html(show_lines(data));
```

Now, I know that there is a lot of things that could be improved in the above code
(as comments in English, use of camelCase, improved spacing and identation, etc),
but it is just to highlight the usage of jQuery and building the html with string
concatenation, which was very common place everywhere.

I am also not talking about [$.ajax](http://api.jquery.com/jquery.ajax/),
which was the jQuery way of fetching data.

Later, with the arrival of template strings and DOM manipulation to browser
javascript implementations, we started seen code like this:

```
function buildPassengersDetails(route){
  let html = `
  <table class="table table-condensed table-bordered " cellspacing="0">
      <thead>
      <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Pickup</th>
      </tr>
      </thead>
      <tbody>
  `;
  for(let passenger of route.points){
    html += `
      <tr>
        <td>${passenger.id}</td>
        <td>${passenger.name}</td>
        <td>${passenger.pickup_time}</td>
      </tr>
    `;
  }
  html += `
          </tbody>
      </table>
      `;
  return html;
}
```

Note also the usage of `for of` instead of jQuery each. The table could be rendered
without the usage of jQuery too:

```
const data = fetch_data();  //fetch() server calls
let table_div = document.getElementById("table-div");
table_div.innerHTML = buildPassengersDetails(data);
```

It is a lot better and readable, but it would be nicer to hide these HTML
manipulation behind API calls, which was exactly what react did.

## The react way

The reason to use API calls instead of the template string is first, it doesn't
feel natural this way, and second, because styles and other html atributes are hard
coded this way. You could add more parameters to the function, to add class and other
HTML attributes, or you could even add a generic function to render the template
string with the tag as a variable too. But it would become complex, since HTML
attributes change for tag to tag. Hopefully, the React team already created a function
you can use, and its called [createElement](https://react.dev/reference/react/createElement).

The above `buildPassengersDetails` could be rewritten with React:

```
function buildPassengersDetails(route){
  let childrenRows = [];
  for(let passenger of route.points){
    childrenRows.push(
      React.createElement(
        'tr',
        null,
        [
          React.createElement('td', null, passenger.id),
          React.createElement('td', null, passenger.name),
          React.createElement('td', null, passenger.pickup_time),
        ]
      )
    )
  }
  return React.createElement(
    'table',
    {
      className: "table table-condensed table-bordered",
      cellSpancing: "0"
    },
    [
      Rect.createElement(
        'thead',
        null,
        React.createElement(
          'tr',
          null,
          [
            React.createElement('th', null, 'ID'),
            React.createElement('th', null, 'Name'),
            React.createElement('th', null, 'Pickup')
          ]
        )
      ),
      Rect.createElement(
        'tbody',
        null,
        childrenRows
      ),
    ]
  );
}
```

And the table could be rendered by calling:

```
const route = fetch_route();  //fetch() server calls
const tableRoot = document.getElementById('table-div');
ReactDOM.render(buildPassengersDetails(route), appRoot);
```

As you can see, createElement receives either another element or an array of
elements, in which you can nest them the same way as in the HTML. The second
argument is called props, short for properties, and is an object with the elements
properties (duh) defined. One of them is className, and it is the same as html class attribute,
but since it is a reserved word in Javascript, they changed slightly. Also some other
attributes are camelCase. [Here](https://legacy.reactjs.org/docs/dom-elements.html#all-supported-html-attributes) is a list of all supported attributes and their names.

I think this code is really better then the other. The createElement function can
be used to create all sort of HTML elements while avoiding code repetition, and
using props as a JS object. But some may find it a little verbose. Hopefully,
this is not the way we do it anymore.

## Here comes Babel and Webpack

[Babel](https://babeljs.io/) is a transcompiler, which means it can translate javascript to javascript
code. It was created to use new javascript features (like arrow functions)
before it was implemented by the browsers, which could take some time. This way,
you could write Javascript using a new spec, and compile it to vanilla javascript,
the one the browser would interpret.

But it is really more than that. One could create custom presets, which are the
rules used by Babel to compile the code. The react team then created a preset and
a "new" language called JSX (javascript markup language). This way, the jsx could
be transpiled to js before it is served to the browser.

We could rewrite the buildPassengersDetails function again, but now in JSX:

```
function buildPassengersDetails(route){
  table = (
    <table className="table table-condensed table-bordered " cellSpacing="0">
        <thead>
        <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Pickup</th>
        </tr>
        </thead>
        <tbody>
          <tr>
            {(route) => route.points.map( passenger => [
              <td>${passenger.id}</td>
              <td>${passenger.name}</td>
              <td>${passenger.pickup_time}</td>]
            )}
          </tr>
        </tbody>
    </table>
  )

  return table;
}
```

And, the same way as before could be used to render the table. If you put the
code above in a `.jsx` file and transpile using babel with react preset,
you would get the exact same function as the one with the createElement calls.

As you can see, JSX blends javascript with HTML. It is really great, and combine the
best from both world: dynamic building of js and nesting feature of html. But what is
even greater is that, one could write the same interface using jsx, compile it with
babel to use in the browser, or use another tool to compile to another platform, as
Android, iOS, or even desktop apps! I did some desktop programing for Windows before,
and everytime I wondered why I was not using HTML instead of that ugly XAML. That
is possible now and is called React Native.

And thats not all. Combining it with a tool like [Webpack](https://webpack.js.org/), one could build really
complex applications, because it allowed you to modularize the app creating components
in different files and combining it using modern es6 import statements.

```

  ┌──────────────┐   ┌───────────────┐   ┌──────────────┐   ┌───────────────┐
  │component1.jsx├──►│               ├──►│component1.js ├──►│               │
  └──────────────┘   │               │   └──────────────┘   │               │
                     │               │                      │               │
  ┌──────────────┐   │               │   ┌──────────────┐   │               │   ┌─────────┐
  │component2.jsx├──►│     Babel     ├──►│component2.js ├──►│    Webpack    ├──►│ index.js│
  └──────────────┘   │               │   └──────────────┘   │               │   └─────────┘
                     │               │                      │               │
  ┌──────────────┐   │               │   ┌──────────────┐   │               │
  │   page.jsx   ├──►│               ├──►│   page.js    ├──►│               │
  └──────────────┘   └───────────────┘   └──────────────┘   └───────────────┘

```

They even created a tool to make it easy, called `create-react-app`, that bootstraps
all the project folder structure along with the needed tools configs.

But it didn't came without disavantages too. The first is that it was not only the
React team (working for facebook) that did this.

## The framework wars

There were also other companies and teams that build their own lib, like angular
(for google) and later vue.js. Although the latter are rather frameworks, they have
the same usage in mind.

And it didn't stop there, everyday a new framework were born and another one died.
They would always claim they were faster and lightweight than their predecessors.

On the end, it became really hard for a newcomer to front end development to get started.

I remember when I first heard of React in a Eurocon video, and how to use with flask,
and oh boy I really wondered how in the world I would remember all that.

Also, an expert in React would have to learn a new framework all over again if a company
employing her used vue.js instead.

## The modern landscape

The landscape in modern front end development changes so fast, that even React itself
changed a lot. First we used to code the components in a class based way. But now
it is recommended to use the functional way.

There is also routing and data binding, which I didn't cover in this post. The
first covers how and which components and pages are rendered according to the
location href or navigation view. The latter how data is propagated to children
down the DOM when changed. Both of them evolved significantly in the recent years.
For instance, for data binding, [redux](https://redux.js.org/) were first the king, but
now hooks and contexts are the way to go.

Even the `create-react-app` tool is not being recommended anymore. There is alternatives,
like [vite](https://vitejs.dev/) and some online web-based project bootstrappers.
This blog is written (at the time being) using react and vite.

All these new tool also run some optimizations steps to make the bundles more efficient
and fast to load for the browser, even optimizing images before bundling it together.

And there is of course [next.js](https://nextjs.org/). Along with the optimization, it allows
the user to define which parts of the application are SPAs, which one are static generated
and the ones that are server side generated. I will cover these topics in a later topic.
It also has a lot of tools to integrate with the back-end, and services provided by
vercel, as edge cached CDNs.

## The future

For the future, there is some new techs coming that in my opinion will change
even further the front end development. One of which is [webassembly](https://webassembly.org/).

The others I can remind for now is [flutter for web](https://flutter.dev/multi-platform/web) and
[htmx](https://htmx.org/), which seems to integrate really well with python
back ends like Django.

But I will cover these in another post, and I think JS and frameworks will still be
used for a while.

## Conclusion

In conclusion, I really think that these tools (React, Babel, Webpack, etc) really
contributed to the development of really complex and interactive applications in a better,
readable and maintainable way, and to make them faster and more efficient. I am really
thankful for the folks behind them.
