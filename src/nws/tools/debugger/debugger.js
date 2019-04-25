const Template = require("../template/template");

function addToDebugger(pClass, pMessage){

}

module.exports = {
    middleware:function(pRequest, pResponse){
        pResponse.realEnd = pResponse.end;
        pResponse.end = function(){
            this.write("debugger");
            this.realEnd();
        };
    },
    trace:function(pString){
        addToDebugger('trace', pString);
    },
    trace_r:function(pData){
        addToDebugger('trace', '<code>'+JSON.stringify(pData)+'</code>');
    }
};