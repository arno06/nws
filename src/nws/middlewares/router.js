let routes = require("../../shared/routes");

module.exports = {
    middleware:function(pRequest, pResponse){
        for(let i in routes){
            if(!routes.hasOwnProperty(i)){
                continue;
            }
            let route = routes[i];
            let url = i;
            let params = {};
            if(route.hasOwnProperty('parameters')){
                params = route.parameters;
            }
            let p = [];
            for(let n in params){
                if(!params.hasOwnProperty(n)){
                    continue;
                }
                url = url.replace('{$'+n+'}', "("+params[n]+")");
                p.push(n);
            }
            let re = new RegExp('^'+url+'$');
            let matches = pRequest.url.match(re);
            if(matches !== null){
                let query_params = {};
                p.forEach(function(pItem, pIndex){
                    query_params[pItem] = matches[pIndex+1];
                });
                let r;
                if(route.hasOwnProperty(pRequest.method)){
                    r = route[pRequest.method];
                }else if(route.hasOwnProperty('*')){
                    r = route['*'];
                }else{
                    return false;
                }
                if(query_params.hasOwnProperty('module')){
                    r = r.replace('{$module}', query_params.module);
                    delete query_params.module;
                }
                if(query_params.hasOwnProperty('method')){
                    r = r.replace('{$method}', query_params.method);
                    delete query_params.method;
                }
                pRequest.query_params = query_params;
                let [module, method] = r.split(".");
                let executable = require("../../routes/"+module)[method];
                executable(pRequest,pResponse);
                return;
            }
        }
    }
};