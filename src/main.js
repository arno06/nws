let nws = require("./nws/nws");
let staticMdw = require('./nws/middlewares/static');
nws.middleware(staticMdw);
nws.run();