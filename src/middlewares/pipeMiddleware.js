const { xrequest } = require('../request');
const Application = require('../core/app');
const HEADER_WHITE_LIST = ['content-language', 'content-length', 'content-type', 'content-encoding', 'connection'];
const COOKIE_PREFIX = 'PL-';

module.exports = function(req, resp) {
    Application.getRequestBody(req, function(data){
        let protocol = data.protocol;

        // Headers starting with ':' crash the application
        const headers = {};
        for (let headerName in data.headers) {
            if (headerName[0] === ':') continue;
            headers[headerName] = data.headers[headerName];
        }

        // The `protocol` property should ends with ':'
        if (protocol[protocol.length - 1] !== ':') protocol += ':';

        const proxyReq = xrequest({
            protocol,
            method: data.method,
            hostname: data.host,
            path: data.path,
            headers,       
        }, function(proxyResp) {
            proxyResp.pipe(resp);
            
            for (let headerName in proxyResp.headers) {
                resp.setHeader(
                    (!HEADER_WHITE_LIST.includes(headerName) ? COOKIE_PREFIX : '') + headerName, 
                    proxyResp.headers[headerName]
                );
            }
        });
        proxyReq.write(data.body || '');
        proxyReq.end();
    }, function(error) {
        resp.writeHead(500);
        resp.end();    
    });
    return true;
};
