const crypto = require("crypto");

let cacheDuration = 120;

function getEtag(pUrl){
    return '"'+crypto.createHash('sha1').update(pUrl).digest('hex')+'"';
}

module.exports = {
    middleware:function(pRequest, pResponse){
        let ifNoneMatch = pRequest.headers["if-none-match"]||null;
        let ifModifiedSince = pRequest.headers['if-modified-since']||null;
        if(!ifNoneMatch||!ifModifiedSince){
            return;
        }
        let eTag = getEtag(pRequest.url);
        let time = Date.parse(ifModifiedSince) + (cacheDuration * 1000);

        if(eTag !== ifNoneMatch || (new Date()).getTime() > time){
            return;
        }

        pResponse.writeHead(304);
        pResponse.end();
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