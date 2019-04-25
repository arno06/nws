const Template = require("../template/template");

let content = {};

let ready = false;
let startTime;

function addToConsole(pClass, pMessage){
    var d = new Date();
    d = d.getHours()+":"+ d.getMinutes()+":"+ d.getSeconds()+"."+ d.getMilliseconds();
    content.console += "<tr class='"+pClass+"'><td class='date'>"+d+"</td><td class='"+pClass+"'></td><td>"+pMessage+"</td></tr>";
}

module.exports = {
    middleware:function(pRequest, pResponse){
        startTime = (new Date().getTime());
        content.console = "";
        pResponse.realEnd = pResponse.end;
        pResponse.end = function(){
            var tpl = new Template('debugger.tpl');
            tpl.setupFolder(process.cwd(), 'nws', 'tools', 'debugger');
            tpl.assign("timeToGenerate", Math.round((new Date().getTime()) - startTime, 2));
            tpl.assign('console', content.console);
            this.write(tpl.evaluate(), 'utf8');
            this.realEnd();
        };
        if(ready){
            return;
        }
        ready = true;
        console.realLog = console.log;
        console.log = function(){
            addToConsole('trace', Array.from(arguments).join(', '));
            console.realLog(...arguments);
        }
    }
};