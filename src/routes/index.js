let Template = require("../nws/tools/template/template");

module.exports = {
    index:function(pRequest, pResponse){
        console.log("bouboup");
        console.info("attention notice");
        console.warn("attention warning");
        console.error("attention error");
        console.table([{a:"1", b:"1"}, {a:"0", b:"0"}]);
        var t = new Template('index.tpl');
        t.assign('test', 'bouboup');
        t.render(pResponse);
    },
    bouboup:function(pRequest, pResponse){
        console.log("there");
        var t = new Template('bouboup.tpl');
        t.assign('test', 'bouboup');
        t.render(pResponse);
    }
};