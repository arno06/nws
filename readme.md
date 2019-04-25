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
    * `controllers` contain the module that will be executed if a route match the requested url (temporary name)
    * `nws` "framework" source (for now)
    * `shared` routes, config...
    * `views` Templates


Route definition
---
```js
module.exports = {
	"/some/route":{
		"get":"controllers/index.index"
	}
};
```
When the `http://localhost:1234/some/route` url is called through a `GET` request, then the module `controllers/index` is `required` and the `index` method of that module is executed with the `request` and `response` parameters

If no route matches, the app sends back a 404 response

Todo
----
  * [/] Keep things simple
  * [x] Running server
  * [x] Middleware architecture implementation
  * [x] Static file middleware
  * [x] Templating - server implementation of [Template](https://github.com/arno06/Template/)
  * [/] Debugger - Similar to the one from [php-fw](https://github.com/arno06/php-fw/)
  * [ ] Dynamic url parameters (`/some/route/{$with}/{$parameters}`)
  * [ ] Performance audit
  * [ ] Stabilize working tree ("controllers" is not a good name)
  * [ ] Databases handler
  * [ ] Authentication middleware
  * [ ] Frontend components support - JS Implementation of [Dependecies](https://github.com/arno06/Dependencies/)
