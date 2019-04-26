const Template = require("../template/template");
const path = require("path");

let debug = true;

let content = {};
let ready = false;
let startTime;
let lastResponse;

let csl = console;

function addToConsole(pClass, pMessage, pFile){
    content.count[pClass]++;
    var d = new Date();
    d = ("0"+d.getHours()).slice(-2)+":"+ ("0"+d.getMinutes()).slice(-2)+":"+ ("0"+d.getSeconds()).slice(-2)+"."+ d.getMilliseconds();
    content.console += "<tr class='"+pClass+"'><td class='date'>"+d+"</td><td class='"+pClass+"'></td><td class='message'>"+pMessage+"</td><td class='file'>"+pFile+"</td></tr>";
}

function getStackFile(pError = null){
    let index = 0;
    if(pError===null){
        pError = new Error();
        index = 3;
    }
    let stack = (pError).stack;
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
    errorHandler:function(pError){
        addToConsole('error', pError.message, getStackFile(pError));
        lastResponse.writeHead(500);
        lastResponse.end();
    },
    middleware:function(pRequest, pResponse){
        if(!debug){
            return;
        }

        startTime = (new Date().getTime());
        content = {
            console:"",
            count:{trace:0,notice:0,warning:0,error:0,query:0,cookie:0,session:0,post:0,get:0},
            memory:process.memoryUsage()
        };
        lastResponse = pResponse;
        pResponse.realEnd = pResponse.end;
        pResponse.end = function(){
            var tpl = new Template('debugger.tpl');
            tpl.setupFolder(process.cwd(), 'nws', 'tools', 'debugger');
            tpl.assign("timeToGenerate", ((new Date().getTime()) - startTime)/1000);
            let used = process.memoryUsage();
            for(let k in used){
                if(!used.hasOwnProperty(k)||!content.memory.hasOwnProperty(k)){
                    continue;
                }
                content.memory[k] = formatMemory(used[k] - content.memory[k]);
            }
            for(let i in content){
                if(!content.hasOwnProperty(i)){
                    continue;
                }
                tpl.assign(i, content[i]);
            }
            this.write(tpl.evaluate(), 'utf8');
            this.realEnd();
        };
        if(ready){
            return;
        }
        ready = true;

        let map = {
            'log':'trace',
            'info':'notice',
            'warn':'warning',
            'error':'error'
        };
        for(var i in map){
            if(!map.hasOwnProperty(i)){
                continue;
            }
            let cb = csl[i];
            let type = map[i];
            console[i] = function(){
                addToConsole(type, Array.from(arguments).join(', '), getStackFile());
                cb(...arguments);
            }
        }
    }
};