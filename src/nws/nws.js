var http = require('http');
var router = require('./middlewares/router').middleware;
var config = require(process.cwd()+'/shared/config');
var errorHandler = require('./middlewares/debugger').errorHandler;

class NWS{

    constructor(){
        this.running = false;
        this.port = 1234;
        this.stack = config.middlewares.map((pModule)=> require(pModule).middleware);
        this.currentMiddleware = 0;
    }

    middleware(pMiddleware){
        this.stack.push(pMiddleware);
    }

    nextMiddleware(pRequest, pResponse){
        var ref = this;
        if(this.currentMiddleware>this.stack.length-1){
            pResponse.writeHead(404);
            pResponse.write("Page not found");
            pResponse.end();
            return;
        }
        this.stack[this.currentMiddleware++](pRequest, pResponse).then(function(){
            if(!pResponse.finished){
                pResponse.writeHead(404);
                pResponse.write("Page not found");
                pResponse.end();
            }
        }, function(){
            ref.nextMiddleware(pRequest, pResponse);
        });
    }

    run(pPort = null){
        if(this.running){
            return;
        }
        if(pPort !== null){
            this.port = pPort;
        }

        console.log('\x1b[36m', 'NWS', '\x1b[0m','running at http://localhost:'+this.port+'/' ,'\x1b[0m');

        var ref = this;
        this.running = true;
        this.middleware(router);
        http.createServer(function(pRequest, pResponse){
            ref.currentMiddleware = 0;
            try{
                ref.nextMiddleware(pRequest, pResponse);
            }
            catch(e){
                console.error(e);
                errorHandler(pResponse, e);
            }
        }).listen(this.port);
    }
}

module.exports = new NWS();