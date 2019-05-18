let Template = require("../nws/tools/template/Server");
let Form = require("../nws/tools/form/Server");

module.exports = {
    index:function(pRequest, pResponse){

        console.log(pRequest.superbody);

        var f = new Form('test');

        if(f.isValid()){
            console.table(f.getValues());
        }else{
            let e = f.getError();
            if(e){
                console.log(e);
            }
        }

        var t = new Template('index.tpl');
        t.assign('test', 'bouboup');
        t.assign('form_test', f.render());
        t.render(pResponse);
    },
    bouboup:function(pRequest, pResponse){
        console.log("there");
        var t = new Template('bouboup.tpl');
        t.assign('test', 'bouboup');
        t.render(pResponse);
    }
};