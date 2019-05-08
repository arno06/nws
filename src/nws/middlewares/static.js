const url = require("url");
const path = require("path");
const fs = require("fs");
const http_cache = require("./http_cache");

module.exports = {
    middleware:function(pRequest, pResponse){
        let uri = url.parse(pRequest.url).pathname;
        let filename = path.join(process.cwd(), '..', 'public', uri);
        if(fs.existsSync(filename)){
            let stats = fs.statSync(filename);
            if(!stats.isFile()){
                return;
            }
            let file = fs.readFileSync(filename, "binary");
            http_cache.store(pRequest, pResponse);
            pResponse.writeHead(200);
            pResponse.write(file, "binary");
            pResponse.end();
        }
    }
};