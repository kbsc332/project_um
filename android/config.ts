var config = {
    production : {
        apollo: {
            uri: "http://127.0.0.1:4000/api"
        },
    },
    debug : {
        apollo: {
            uri: "http://127.0.0.1:4000/api"
        },
    }
}

var getCurrentConfig = function() {
    if (process.env.NODE_ENV === 'production') {
       return config.production;
    }
    return config.debug;
}

var CurrentConfig = getCurrentConfig();
export default CurrentConfig;
