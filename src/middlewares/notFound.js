const IMG_BLACK = 'R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=';
const IMG_TRANSPARENT = 'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

module.exports = function(req, resp) {
    const acceptHeader = req.headers['accept'] || req.headers['Accept'] || '';

    if (acceptHeader.includes('image/*')) {
        const base64px = IMG_BLACK;
        const img = Buffer.from(base64px, 'base64');

        resp.writeHead(200, {
            'Content-Type': 'image/gif',
            'Content-Length': img.length
        });
        resp.end(img); 
    } 
    else {
        resp.writeHead(404);
        resp.end();
    }
};