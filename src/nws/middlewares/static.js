var url = require("url");
var path = require("path");
var fs = require("fs");

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
            pResponse.writeHead(200);
            pResponse.write(file, "binary");
            pResponse.realEnd();
        }
    }
};