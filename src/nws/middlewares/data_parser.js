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
                pRequest.superbody = body;
                pReject();
            });
        });

    }
};