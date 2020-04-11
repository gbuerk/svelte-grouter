# svelte-grouter

svelte-grouter is a simple client-side routing engine designed for use in [svelte](https://svelte.dev) projects.  It is heavily inspired by [svelte-routing](https://github.com/EmilTholin/svelte-routing) and [svero](https://github.com/kazzkiq/svero), but aims to address some issues I have noticed while attempting to use each.  I also took heavy influence from [this great blog post](https://medium.com/swlh/simple-svelte-3-app-with-router-44fe83c833b6).

## Features
* GRouter allows full and reactive access to the current route, even outside of the context of the router.  The interface to this is a `svelte store`, which makes it really easy to subscribe to changes to the url.
* It supports path and query parameter binding and uses a simplified and unified model for accessing and setting parameters
* It supports push state routing and history
* It separates route names from paths which makes it easier to change paths later

## Install
```
npm install --save-dev svelte-grouter
```

## Usage
```html
<script>

// Import GRouter svelte component
import { GRouter, Link } from 'svelte-grouter'

// Import your top level page componenets - these are plain svelte components, nothing to do with the router
import Home from './Home.svelte'
import About from './About.svelte'

// Create your routes
const routes = {
    'home': {
        path: '/home',
        component: Home
    },
    'about': {
        path: '/about',
        component: About
    },
}

</script>

<!-- Optionally define your navigation bar -->
<nav>
    <Link route={routes.home} >Home</Link>
    <Link route={routes.about} >About</Link>
</nav>

<!-- Reference the GRouter component.  The components referenced in your routes will be rendered here when the URL pattern matches -->
<GRouter {routes} />

```


## API

#### `GRouter`

This is a svelte component that provides the entry point for this whole package.  There should only be one instance of GRouter on your page at any given time.  The components specified in your routes will render where this component is referenced when the URL matches their path patterns.

###### Properties

|  Property  | Required | Default Value | Description |
| --- | --- | --- | --- |
| `routes` | `yes` |  | An object representing your routes.  See the section on `Routes` for a description of how to define routes |

#### `Link`

This is a svelte component that can be used to create an anchor tag that routes through the GRouter instead of the browser which saves a page refresh.

###### Properties

|  Property  | Required | Default Value | Description |
| --- | --- | --- | --- |
| `route` | `yes` |  | An object representing the route to link to.  See the section on `Routes` for a description of how to define a route |
| `params` | `no` | `{}` | An object representing all parameters, both path and query, that may need to be used to populate the route.  This is a simple key value pair.  If a path param is defined in the path of the route, and the corresponding key is defined on this params object, it will be populated.  All other keys on this object (those that don't match a path param from the routes path) will be placed on the end of the url as query parameters.  For example: If the route path is `/person/:id` and the params object is `{id: '123', showAll: false, showAccounts: true}`, the resulting link would be to `/person/123?showAll=false&showAccounts=true` |
| `activeClass` | `no` | `active` | A string the defines a class that will be present on the anchor tag if the route specified matches the currently active route.  This makes it easy to style currently active links.  See the examples below. |

###### Examples

This example shows how to declare routes and use them in links with path and query parmeters

```html
<script>
import { GRouter, Link } from 'svelte-grouter'
import Home from './Home.svelte'
import About from './About.svelte'
import Person from './Person.svelte'

const routes = {
    'home': {
        path: '/home',
        component: Home
    },
    'about': {
        path: '/about',
        component: About
    },
    'person': {
        path: '/person/:id',
        component: Person
    },
}
</script>

<nav>
    <Link route={routes.home}>Home</Link>
    <Link route={routes.about}>About</Link>
    <Link route={routes.person} params={{id:123}}>Person with path param id = 123</Link>
    <Link route={routes.person} params={{id:456, showAll:true}}>Person with path param id = 456 and query param showAll = true</Link>
</nav>
<GRouter {routes} />

<!-- Styling the anchor tag of a Link component -->
<style>
nav :global(a) {
	padding: 1rem;
}
nav :global(a.active) {
	background-color: blue;
	color: white;
}
</style>
```

This example shows how to use the activeClass feature

```html
<script>
import { GRouter, Link } from 'svelte-grouter'
import Home from './Home.svelte'
import About from './About.svelte'

const routes = {
    'home': {
        path: '/home',
        component: Home
    },
    'about': {
        path: '/about',
        component: About
    },
}
</script>

<nav>
    <Link route={routes.home} activeClass='customActiveClass' >Home</Link>
    <Link route={routes.about} activeClass='customActiveClass' >About</Link>
</nav>
<GRouter {routes} />

<!-- Styling the anchor tag of a Link component -->
<!-- Notice how we style the active link with customActiveClass because of the 'activeClass' property in the Link references above -->
<style>
nav :global(a.customActiveClass) {
	background-color: blue;
	color: white;
}
</style>
```

#### `navigateTo`

This is a function that can be used to programatically navigate to a route, passing any required params.

###### Properties

|  Property  | Required | Default Value | Description |
| --- | --- | --- | --- |
| `route` | `yes` |  | An object representing the route to navigate to.  This can be a Route object as defined in the section on `Routes`, or it could be a string representing the route name, as defined in the `name` property on the route.  Using a string is a convenient way to avoid cyclic dependencies should one of your routes need to link to another.  See the section on `Routes` for a description of how to define a route |
| `params` | `no` | `{}` | An object representing all parameters, both path and query, that may need to be used to populate the route.  This is a simple key value pair.  If a path param is defined in the path of the route, and the corresponding key is defined on this params object, it will be populated.  All other keys on this object (those that don't match a path param from the routes path) will be placed on the end of the url as query parameters.  For example: If the route path is `/person/:id` and the params object is `{id: '123', showAll: false, showAccounts: true}`, the resulting link would be to `/person/123?showAll=false&showAccounts=true` |

###### Examples

```html
<script>
import { GRouter, Link, navigateTo } from 'svelte-grouter'
import Home from './Home.svelte'
import About from './About.svelte'
import Person from './Person.svelte'

const routes = {
    'home': {
        path: '/home',
        component: Home
    },
    'about': {
        path: '/about',
        component: About
    },
    'person': {
        path: '/person/:id',
        component: Person
    },
}
</script>

<nav>
    <button on:click={() => navigateTo(routes.home)} >Home</button>
    <button on:click={() => navigateTo(routes.about)} >About</button>
    <button on:click={() => navigateTo(routes.person, { id: 123 })} >Person with path param id = 123</button>
    <button on:click={() => navigateTo(routes.person, { id: 456, showAll: true })} >Person with path param id = 456 and query param showAll = true</button>
</nav>
<GRouter {routes} />
```


#### `currentRoute`

This is a `svelte store` that, when subscribed to, will reactivly update with the current route and params.

###### Examples

This example shows how you can log the current route every time it changes

```html
<script>
import { GRouter, Link, currentRoute } from 'svelte-grouter'
import Home from './Home.svelte'
import About from './About.svelte'
import Person from './Person.svelte'

const routes = {
    'home': {
        path: '/home',
        component: Home
    },
    'about': {
        path: '/about',
        component: About
    },
    'person': {
        path: '/person/:id',
        component: Person
    },
}

// THIS IS THE INTERESTING PIECE - we're subscribed to the current route and printing it out whenever it changes
$: console.log($currentRoute)

</script>

<nav>
    <Link route={routes.home}>Home</Link>
    <Link route={routes.about}>About</Link>
    <Link route={routes.person} params={{id:123}}>Person with path param id = 123</Link>
    <Link route={routes.person} params={{id:456, showAll:true}}>Person with path param id = 456 and query param showAll = true</Link>
</nav>
<GRouter {routes} />
```

This example shows how to gather information from the url about my component

```html
<!-- Person.svelte -->
<h1>This is Person page</h1>
<p>
    id: {$currentRoute.params.id}
</p>
<p>
    showAll: {$currentRoute.params.showAll}
</p>

<script>
import { currentRoute } from 'svelte-grouter'

</script>
```


#### `Routes`

This is an object that users must provide to define the routes of the application.  

###### Properties

The keys of this object are names of routes.  The values are objects, each defining a route.  The API for a single route is listed below.

|  Property  | Required | Default Value | Description |
| --- | --- | --- | --- |
| `path` | `yes` |  | A string - The path of the route.  This can be a static string like `/person`, a dynamic string with path parameters like `/person/:id`, or a `*` as a catch-all |
| `name` | `no` | undefined |  A string - The name of the route.  This is required if you want to reference routes by name in `Link` or `navigateTo`, rather than passing in the whole route.  This is also required if `redirect` routes are present in this application |
| `component` | `One of component, layout, or redirectTo is required for each route` |  | An object - The svelte component to render when the path pattern patches |
| `layout` | `One of component, layout, or redirectTo is required for each route` |  | An object that defines the layout Component and which slots to use to build the page.  See the section on `Layouts` for further description and examples |
| `redirectTo` | `One of component, layout, or redirectTo is required for each route` |  | A string - the name of the route to redirect to when the path pattern matches.  Note, this is not the _path_ to redirect to, it' the _name_ of the route. |
| `params` | `READ ONLY` |  | An object - when the user is subscribed to `currentRoute`, the route object will contain this field.  It contains key / value pairs of all parameters, path and query, in the context of the current route.  See the example above in the `currentRoute` section.  If the user explicitly defines `params` in their routes, those params will be ignored.  This property is intended to be read only. |

###### Examples

```html
<script>
import { GRouter, Link, currentRoute } from 'svelte-grouter'
import Home from './Home.svelte'
import Person from './Person.svelte'
import {routes} from './routes.js'

</script>

<nav>
    <Link route={routes.home}>Home</Link>
    <Link route={routes.person} params={{id:123}}>Person with path param id = 123</Link>
    <Link route={routes.person} params={{id:456, showAll:true}}>Person with path param id = 456 and query param showAll = true</Link>
</nav>
<GRouter {routes} />
```

```js
// routes.js
import Home from './Home.svelte';
import Person from './Person.svelte';
export const routes = {
    // Simple static route
    'home': {
        name: 'home',
        path: '/home',
        component: Home
    },
    // Route with dynamic path parameter
    'person': {
        name: 'person',
        path: '/person/:id',
        component: Person
    },
    // Route that redirects to another route
    'default': {
        name: 'default',
        path: '*',
        redirectTo: 'home'
    }
}
```

#### `Layouts`

This is an object that can by used to build dynamic layouts on your page. This object can be used as the value of the `layout` property on a route.

###### Properties

|  Property  | Required | Default Value | Description |
| --- | --- | --- | --- |
| `component` | `yes` |  | A svelte component that defines the layout component to use.  This component should `export let slots`, a variable that will be passed in to the layout and can be used to put appropriately named slots on the page in various places.  The syntax for using the `slot` variable is `<svelte:component this={slots.header} />`.  In this example, the `header` slot has been defined on the layout object and will be made avaiable to the layout component. |
| The rest of the property names define slot names to be used in the layout | no |   | Each slot named value corresponds to a svelte component that will be made available in the layout to fill that slot.  See examples below. |

###### Examples

```html
<!-- Layout.svelte - the Layout Component -->
<script>
export let slots
</script>

<div class="layout">
    <header>
        <svelte:component this={slots.header} />
    </header>
    <svelte:component this={slots.content} />
</div>
```
The above example shows two sloted components called `header` and `content` respectively.  The would be declaired in the route as follows:

```js
// routes.js
import Home from './Home.svelte';
import Header from './Header.svelte';
import Layout from './Layout.svelte';

export const routes = {
    // Route showing layout
    'home': {
        path: '/home',
        layout: {
            component: Layout,
            content: Home,
            header: Header
        }
    }
}
```

