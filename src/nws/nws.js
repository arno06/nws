var http = require('http');
var router = require('./middlewares/router').middleware;
var debug = require('./tools/debugger/debugger').middleware;

class NWS{

    constructor(){
        this.running = false;
        this.port = 1234;
        this.stack = [debug];
    }

    middleware(pMiddleware){
        this.stack.push(pMiddleware);
    }

    run(pPort = null){
        this.middleware(router);
        if(this.running){
            return;
        }
        if(pPort !== null){
            this.port = pPort;
        }

        var ref = this;
        this.running = true;
        http.createServer(function(pRequest, pResponse){
            for(let i = 0, max = ref.stack.length; i<max; i++){
                ref.stack[i](pRequest, pResponse);
                if(pResponse.finished){
                    return;
                }
            }
            if(!pResponse.finished){
                pResponse.writeHead(404);
                pResponse.write("Page not found");
                pResponse.end();
            }
        }).listen(this.port);
    }
}

module.exports = new NWS();