let raw_routes = require("../../shared/routes");

let routes = {};

for(let r in raw_routes){
    if(!raw_routes.hasOwnProperty(r)){
        continue;
    }
    for(let m in raw_routes[r]){
        let method = m.toUpperCase();
        if(!routes.hasOwnProperty(method)){
            routes[method] = {};
        }
        routes[method][r] = raw_routes[r][m];
    }
}

module.exports = {
    middleware:function(pRequest, pResponse){
        if(!routes.hasOwnProperty(pRequest.method)){
            return;
        }
        /**
         * @todo handle parameters
         */
        let paths = routes[pRequest.method];
        for(let i in paths){
            if(!paths.hasOwnProperty(i)){
                continue;
            }
            let re = new RegExp('^'+i+'$');
            if(re.test(pRequest.url)){
                let [module, method] = paths[i].split(".");
                let executable = require("../../"+module)[method];
                executable(pRequest,pResponse);
            }
        }
    }
};