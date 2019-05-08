module.exports = {
    debug:true,
    not_found:'',
    middlewares:[
        './middlewares/http_cache',
        './middlewares/static',
        './middlewares/dependencies',
        './middlewares/debugger'
    ]
};