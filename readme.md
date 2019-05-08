Node WebServer
===

NodeJS web framework for learning purpose, somehow inspired by Express


Dependencies
---

The least possible, for now : none


Getting started
---

From `src` folder :

```
node main.js
```

Then in your browser : `http://localhost:1234/`


What's what
---

  * `public/` contains all statics files exposed throw the static middleware
  * `src/` contains everything else
    * `nws` "framework" source (for now)
    * `routes` contains modules that could be executed if a route match the requested url
    * `shared` routes, config...
    * `views` Templates


Route definition
---
```js
module.exports = {
	"/some/route":{
		"get":"index.index"
	}
};
```
When the `http://localhost:1234/some/route` url is called through a `GET` request, then the module `routes/index` is `required` and the `index` method of that module is executed with the `request` and `response` parameters

If no route matches, the app sends back a 404 response

Todo
----
  * [ ] WIP - Keep things simple
  * [x] Running server
  * [x] Middleware architecture implementation
  * [x] Static file middleware
  * [x] Templating - server implementation of [Template](https://github.com/arno06/Template/)
    * [x] Template Abastraction
    * [x] Server implementation
    * [ ] WIP - Client implementation
  * [x] Debugger - ~~Similar to the one from [php-fw](https://github.com/arno06/php-fw/)~~ Based upon browser's console
  * [x] Dynamic url parameters (`/some/route/{$with}/{$parameters}`)
  * [x] HTTP Cache middleware
  * [ ] WIP - Frontend components support - JS Implementation of [Dependencies](https://github.com/arno06/Dependencies/)
  * [ ] Form component (shared between frontend and backend)
  * [ ] Performance audit
  * [ ] Databases handler
  * [ ] Authentication middleware
  * [ ] Stabilize working tree
