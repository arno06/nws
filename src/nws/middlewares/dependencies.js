const querystring = require("querystring");
const path = require('path');
const fs = require('fs');
const dependencies = require(path.join(process.cwd(), 'shared', 'manifest.json'));
const http_cache = require("./http_cache");

function calculateNeed(pNeeded, pFinalList){
    for(let i = 0, max = pNeeded.length; i<max; i++){
        let n = pNeeded[i];
        if(!dependencies.hasOwnProperty(n)){
            output += "console.log('"+n+"');";
            continue;
        }
        pFinalList.unshift(n);
        if(dependencies[n].hasOwnProperty("need")){
            calculateNeed(dependencies[n].need.reverse(), pFinalList);
        }
    }
}

let output;

module.exports = {
    middleware:function(pRequest, pResponse){
        if(pRequest.url.indexOf("/dependencies?")!==0){
            return;
        }
        let qstring = pRequest.url.split("?")[1];
        let params = querystring.parse(qstring);
        if(!params.need){
            return;
        }

        http_cache.store(pRequest, pResponse);

        let needs = params.need.split(",");
        let type = params.type||"javascript";

        output = "";
        let entries = [];
        calculateNeed(needs, entries);

        for(let i = 0, max = entries.length; i<max;i++){
            let name = entries[i];
            let cpt = dependencies[name];
            if(!cpt.hasOwnProperty(type)){
                continue;
            }
            let files = cpt[type];
            for(let j = 0, maxj = files.length; j<maxj; j++){
                let f = files[j];
                if(!fs.existsSync(f)){
                    continue;
                }
                output += fs.readFileSync(f, "utf8");
            }
        }
        pResponse.setHeader("Content-Type", "application/javascript");
        pResponse.writeHead(200);
        pResponse.write(output);
        pResponse.end();
    }
};