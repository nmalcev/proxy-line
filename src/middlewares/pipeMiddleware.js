const { xrequest } = require('../request');
const Application = require('../core/app');
const HEADER_WHITE_LIST = ['content-language', 'content-length', 'content-type', 'content-encoding', 'connection'];
const COOKIE_PREFIX = 'pl-';

// checks if requested data is valid
function signatureIsValid(data) {
    if (!data.method || !data.path || !data.protocol || !data.host) {
        return false;
    }
    return true;
}

module.exports = function(req, resp) {
    Application.getRequestBody(req, function(data){
        if (!signatureIsValid(data)) {
            resp.writeHead(500);
            resp.end('Invalid set of parameters for the requested resource');
            return;
        }
        
        let protocol = data.protocol;

        const originalHeaders = data.headers || {};
        const headers = {};
        for (let headerName in originalHeaders) {
            // Headers starting with ':' crash the application
            if (headerName[0] === ':') continue;
            headers[headerName] = originalHeaders[headerName];
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
            
            let headerName;
            let resendHeaderName;
            
            for (let originalHeaderName in proxyResp.headers) {
                headerName = originalHeaderName.toLowerCase();
                resendHeaderName = (!HEADER_WHITE_LIST.includes(headerName) ? COOKIE_PREFIX : '') + headerName; 
                resp.setHeader(
                    resendHeaderName,
                    proxyResp.headers[headerName]
                );
            }
            
            // The "Access-Control-Expose-Headers" header helps to avoid the browser errors with message "Refused to get unsafe header"
            resp.setHeader('Access-Control-Expose-Headers', '*');
        });
        proxyReq.write(data.body || '');
        proxyReq.end();
    }, function(error) {
        resp.writeHead(500);
        resp.end();    
    });
    return true;
};
