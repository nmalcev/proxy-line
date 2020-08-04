const { xrequest } = require('../request');
const Application = require('../core/core');
const HEADER_WHITE_LIST = ['content-language', 'content-length', 'content-type', 'content-encoding', 'connection'];
const COOKIE_PREFIX = 'pl-';

const STORAGE = {
    secret: {
        u0009: {
            host: '.host.com',
            header: {
                cookie: ['$secret', 'value']
            }
        }
    }
};

// checks if requested data is valid
function signatureIsValid(data) {
    if (!data.method || !data.path || !data.protocol || !data.host) {
        return false;
    }
    return true;
}

function pipeMiddleware(req, resp) {
    /**
     * @property {object} data
     * @property {string} data.host
     * @property {string} [data.sid] - The secret id
     * @property {string} data.protocol
     * @property {Object} [data.headers]
     * 
     * data.sid does not protect against the uncontrolled use of secret data in cookies, but it keeps them from being copied
     */
    Application.getRequestBody(req, function(data){
        if (!signatureIsValid(data)) {
            resp.writeHead(500);
            resp.end('Invalid set of parameters for the requested resource');
            return;
        }
        
        // The `protocol` property should ends with ':'
        let protocol = data.protocol + (data.protocol.endsWith(':') ? '' : ':');
        let headerMap;
        
        if (data.sid) {
            const secret = STORAGE.secret[data.sid];
            // Check if data.host ends with secret.host
            if (0 === data.host.length - data.host.indexOf(secret.host) - secret.host.length) {
                headerMap = secret.header;
            }
        }

        const originalHeaders = data.headers || {};
        const headers = {};
        for (let headerName in originalHeaders) {
            // Headers starting with ':' crash the application
            if (headerName[0] === ':') continue;
            
            
            headers[headerName] = originalHeaders[headerName];

            // The secret handling
            if (
                headerMap && 
                Array.isArray(headerMap[headerName]) && 
                headers[headerName]
            ) {
                let patterns = headerMap[headerName];
                for (let i = 0; i < patterns.length; i += 2) {
                    headers[headerName] = (headers[headerName] + '').
                        replace(patterns[i], patterns[i + 1]);
                }
            }
        }

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

module.exports = {
    pipeMiddleware,
    setSecretBase: function(object) {
        STORAGE.secret = object;
    }
};
