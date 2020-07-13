const { xrequest } = require('../request');
const Application = require('../core/app');
const HEADER_WHITE_LIST = ['content-language', 'content-length', 'content-type'];

module.exports = function(req, resp) {
    Application.getRequestBody(req, function(data){
        let protocol = data.protocol;

        // The `protocol` property should ends with ':'
        if (protocol[protocol.length - 1] !== ':') protocol += ':';


        const proxyReq = xrequest({
            protocol,
            method: data.method,
            hostname: data.host,
            path: data.path,
            headsers: data.headers,       
        }, function(proxyResp) {
            proxyResp.pipe(resp);
            for (let headerName in proxyResp.headers) {
                resp.setHeader(
                    (!HEADER_WHITE_LIST.includes(headerName) ? 'monkey-' : '') + headerName, 
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