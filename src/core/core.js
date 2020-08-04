const $http = require('http');

module.exports = class Application {
    constructor () {
        this.middlewares = [];
        
    }

    initialize() {
        return $http.createServer((request, response) =>{
            this.runMiddlewares(request, response);
        });
    }

    addMiddleware(callback) {
        this.middlewares.push(callback);
    }

    addInitialMiddleware(callback) {
        this.middlewares.unshift(callback);
    }

    runMiddlewares(request, response) {
        for(let i = 0; i < this.middlewares.length; i++) {
            if (this.middlewares[i](request, response)) break;
        }
    }

    static getRequestBody(request, onEndCallback, onErrorCallback) {
        const chunks = [];
        const isJSON = this.isJSON(request);

        request.on('data', function(chunk){
	    	chunks.push(chunk);
        });
        request.on('end', function(){
            const body = Buffer.concat(chunks).toString();
            onEndCallback(isJSON ? JSON.parse(body) : body);
        });

        if (onErrorCallback) request.on('error', onErrorCallback);
    }

    static getRequestContentType(request) {
        return request.headers['content-type'] || request.headers['Content-Type'];
    }

    static isJSON(request) {
        return this.getRequestContentType(request) === 'application/json';
    }
};
