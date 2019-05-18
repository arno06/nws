module.exports = {
    middlewares:[
        './middlewares/http_cache',
        './middlewares/static',
        './middlewares/dependencies',
        './middlewares/debugger'
    ],
    http_cache:{
        duration:120
    }
};