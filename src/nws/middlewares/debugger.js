const path = require("path");

let debug = true;

let content = {};
let ready = false;
let startTime;

let csl = console;

function getStackFile(pError = null){
    let index = 0;
    if(!pError){
        pError = new Error();
        index = 3;
    }
    let stack = pError.stack||"";
    let file = stack.match(/\([^\)]+\)/g);
    file = file[index].replace("(", "").split(":");
    file.pop();
    let line = file.pop();
    file = file.join(":");
    file = path.relative(process.cwd(), file);
    return file+":"+line;
}

function formatMemory(pValue){
    if(pValue<0){
        return "0 o";
    }
    let units = ["o", "ko", "Mo", "Go"];
    let k = 0;
    while(units[k++] && pValue>1024){
        pValue /= 1024;
    }
    pValue = Math.round(pValue*100)/100;
    return pValue+" "+units[--k];
}

module.exports = {
    errorHandler:function(pResponse, pError){
        pResponse.setHeader("Content-Type", "text/html;charset=UTF-8");
        pResponse.writeHead(500);
        if(!ready){
            pResponse.write("<html><body><h1>Internal server error</h1></body></html>");
        }else{
            let s = pError.stack.split("\n");
            s.shift();
            let str = s.reduce((pResult, pEntry)=>pResult+"<li>"+pEntry+"</li>", "<ul>")+"</ul>";
            pResponse.write("<html><body><h1>"+pError.message+"</h1><div>"+str+"</div></body></html>");
        }
        pResponse.end();
    },
    middleware:function(pRequest, pResponse){
        return new Promise(function(pResolve, pReject){
            if(!debug){
                pReject();
                return;
            }

            startTime = (new Date().getTime());
            content = {
                console:[],
                memory:process.memoryUsage()
            };
            pResponse.realEnd = pResponse.end;
            pResponse.end = function(){
                let type = this.getHeader("Content-Type")?this.getHeader("Content-Type").toLowerCase():"";
                if(type.indexOf("text/html")===-1){
                    this.realEnd();
                    return;
                }
                let timeToGenerate = ((new Date().getTime()) - startTime)/1000;
                let used = process.memoryUsage();
                for(let k in used){
                    if(!used.hasOwnProperty(k)||!content.memory.hasOwnProperty(k)){
                        continue;
                    }
                    content.memory[k] = formatMemory(used[k] - content.memory[k]);
                }
                let id = "'NWS '+String.fromCodePoint(0x23F1)+' "+timeToGenerate+"s   '+String.fromCodePoint(0x1F3C1)+' "+content.memory.heapUsed+"'";
                let output = "console.groupCollapsed("+id+");";
                output = content.console.reduce(function(pOutput, pEntry){
                    return pOutput+"console."+pEntry[0]+".apply(null,"+pEntry[1]+");";
                }, output);
                output += "console.groupEnd("+id+");";
                id = "'NWS query params :'";
                output += "console.groupCollapsed("+id+");";
                output += "console.table.apply(null, ["+JSON.stringify(pRequest.query_params)+"]);";
                output += "console.groupEnd("+id+");";
                this.write("<script>"+output+"</script>", 'utf8');
                this.realEnd();
            };
            if(ready){
                pReject();
                return;
            }
            ready = true;

            let excepts = ['table', 'dir'];
            let preCss = "font-size:11px;color:#888;";
            let valCss = "font-size:12px;color:#000;";
            ['info','warn', 'error', 'table', 'dir', 'log'].forEach(function(pMethod){
                let cb = csl[pMethod];
                console[pMethod] = function(){
                    let e = pMethod==="error"&&typeof arguments[0]!=="string"?arguments[0]:null;
                    let f = getStackFile(e);
                    if(f.indexOf("console.js:")===-1&&f.indexOf("/console/constructor.js")===-1){//internal callings (ie : console.table calling console.log)
                        let arg = Array.from(arguments);
                        let d = new Date();
                        d = ("0"+d.getHours()).slice(-2)+":"+ ("0"+d.getMinutes()).slice(-2)+":"+ ("0"+d.getSeconds()).slice(-2)+"."+ d.getMilliseconds();
                        if(excepts.indexOf(pMethod)===-1){
                            if(arg.length===1){
                                arg = ["%c"+d+" "+f+"\u0009\u0009%c"+arg[0], preCss, valCss];
                            }else{
                                arg.unshift(d+" " +f);
                            }
                        }else{
                            content.console.push(["log",JSON.stringify(["%c"+d+" "+f, preCss])]);
                        }
                        content.console.push([pMethod, JSON.stringify(arg)]);
                    }
                    cb(...arguments);
                };
            });
            pReject();
        });
    }
};