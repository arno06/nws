const MAX_LENGTH = ( 1024 * 1024 ) * 8;//8Mb

module.exports = {
    middleware:function(pRequest, pResponse){
        return new Promise(function(pResolve, pReject){
            if(["POST","PUT", "PATCH", "DELETE"].indexOf(pRequest.method)===-1){
                pReject();
                return;
            }
            let body = "";
            pRequest.on("data", function(chunk){
                body += chunk;
                if(body.length>MAX_LENGTH){
                    throw new Error(pRequest.method+" body size exceeded");
                }
            });
            pRequest.on("end", function(){
                let data = {};
                switch(pRequest.headers['content-type']){
                    case "application/x-www-form-urlencoded":
                        let entries = body.replace(/\+/g, '%20').split('&').map(decodeURIComponent);
                        entries.forEach(function(pItem){
                            let s = pItem.split('=');
                            let names = s[0].match(/[^\]\[]+/g);
                            let t = data;
                            names.forEach(function(pItem, pIndex){
                                if(!t[pItem]){
                                    t[pItem] = {};
                                }
                                if(pIndex === names.length-1){
                                    t[pItem] = s[1];
                                }else{
                                    t = t[pItem];
                                }
                            });
                        });
                        break;
                }
                pRequest[pRequest.method.toLowerCase()] = data;
                pReject();
            });
        });

    }
};