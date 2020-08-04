const Application = require('./core/core');
const notFoundMiddleware = require('./middlewares/notFound');
const corsMiddleware = require('./middlewares/corsMiddleware');
const { pipeMiddleware } = require('./middlewares/pipeMiddleware');


const app = new Application();

app.addMiddleware(corsMiddleware);
app.addMiddleware((req, resp) => {
    if (req.url === '/health') {
        if (req.method === 'GET') {
            resp.writeHead(200, 'OK', { 'Content-Type': 'text/html' });
            resp.write('<h1>Still work</h1>');
        } else {
            resp.writeHead(200, 'OK');
        }
        
        resp.end();
    }
    else if (req.method === 'POST' && (req.url === '/request' || req.url === '/request/')) {
        pipeMiddleware(req, resp);
    }
    else {
        notFoundMiddleware(req, resp);
    }
});

module.exports = app;