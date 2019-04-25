let Template = require("../nws/tools/template/template");

module.exports = {
    index:function(pRequest, pResponse){
        var t = new Template('index.tpl');
        t.assign('test', 'bouboup');
        t.render(pResponse);
    },
    bouboup:function(pRequest, pResponse){
        var t = new Template('bouboup.tpl');
        t.assign('test', 'bouboup');
        t.render(pResponse);
    }
};