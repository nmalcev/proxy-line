module.exports = function(req, resp) {
    if (req.method !== 'OPTIONS') {
        resp.setHeader('Access-Control-Allow-Origin', '*');
        return false;
    }
    // This is preflight request
    resp.writeHead(200, {  
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'PROPFIND, PROPPATCH, COPY, PATCH, MOVE, DELETE, MKCOL, LOCK, UNLOCK, PUT, GETLIB, VERSION-CONTROL, CHECKIN, CHECKOUT, UNCHECKOUT, REPORT, UPDATE, CANCELUPLOAD, HEAD, OPTIONS, GET, POST',
        'Access-Control-Allow-Headers': 'Overwrite, Destination, Content-Type, Depth, User-Agent, X-File-Size, X-Requested-With, If-Modified-Since, X-File-Name, Cache-Control',
        'Access-Control-Max-Age': 600, // 600s maximum at Chrome and 86400s at Firefox
        'Content-Type': 'application/json'
    });
    resp.end();
    return true;
};
