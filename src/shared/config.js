module.exports = {
    middlewares:[
        './middlewares/http_cache',
        './middlewares/static',
        './middlewares/dependencies',
        './middlewares/debugger',
        './middlewares/data_parser'
    ],
    http_cache:{
        duration:120
    }
};