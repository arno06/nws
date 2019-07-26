const crypto = require("crypto");
const path = require("path");
const config = require(path.join(process.cwd(), "shared", "config"));

let cacheDuration = config.http_cache&&config.http_cache.duration?config.http_cache.duration:120;

function getEtag(pUrl){
    return '"'+crypto.createHash('sha1').update(pUrl).digest('hex')+'"';
}

module.exports = {
    middleware:function(pRequest, pResponse){
        return new Promise(function(pResolve, pReject){
            let ifNoneMatch = pRequest.headers["if-none-match"]||null;
            let ifModifiedSince = pRequest.headers['if-modified-since']||null;
            if(!ifNoneMatch||!ifModifiedSince){
                pReject();
                return;
            }
            let eTag = getEtag(pRequest.url);
            let time = Date.parse(ifModifiedSince) + (cacheDuration * 1000);

            if(eTag !== ifNoneMatch || (new Date()).getTime() > time){
                pReject();
                return;
            }

            pResponse.writeHead(304);
            pResponse.end();
            pResolve();
        });
    },
    store:function(pRequest, pResponse){
        pResponse.setHeader("Cache-Control", "max-age="+cacheDuration+", public");
        pResponse.setHeader("eTag", getEtag(pRequest.url));
        let now = new Date();
        let expires = new Date();
        expires.setTime(expires.getTime() + (cacheDuration * 1000));
        pResponse.setHeader("Last-Modified", now.toUTCString());
        pResponse.setHeader("Expires", expires.toUTCString())
    },
    getEtag:getEtag
};