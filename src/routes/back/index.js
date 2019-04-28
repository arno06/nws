module.exports = {
    index:function(pRequest, pResponse){
        pResponse.writeHead(200);
        pResponse.write("<h1>/back/index/index</h1>");
        pResponse.end();
    },
    listing:function(pRequest, pResponse){
        pResponse.writeHead(200);
        pResponse.write("<h1>/back/index/listing</h1>");
        pResponse.end();
    }
};