let Template = require("../nws/tools/template/template");

module.exports = {
    index:function(pRequest, pResponse){


        let p1 = new Promise(function(pResolve, pReject){
            setTimeout(function(){
                console.log("p1");
                pReject("nop p1 after 1s");
            }, 1000);
        });

        let p2 = new Promise(function(pResolve, pReject){
            setTimeout(function(){
                console.log("p2");
                pResolve("yes p2 after 2s");
            }, 2000)
        });

        Promise.all([p1, p2]).then(function(v){
            console.log("then", v);
        }).catch(function(e){
            console.log("catch e");
        });

        let o = {"test":function(){}, "foo":"bar", "num":12};
        console.dir(o);

        console.log("éèçé");
        console.log("bouboup");
        console.info("attention notice");
        console.warn("attention warning");
        console.error("attention error");
        console.table([{a:"1", b:"1"}, {a:"0", b:"0", c:"0"}, {bouboup:42}, {bouboup:[1,2,3]}]);
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