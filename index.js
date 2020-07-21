const Application = require('./src/core/app');
const notFoundMiddleware = require('./src/middlewares/notFound');
const corsMiddleware = require('./src/middlewares/corsMiddleware');
const pipeMiddleware = require('./src/middlewares/pipeMiddleware');


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
    else if (req.method === 'POST' && req.url === '/request') {
        pipeMiddleware(req, resp);
    }
    else {
        notFoundMiddleware(req, resp);
    }
});

const PORT = process.env.PORT || 61000;
const HOST = process.env.HOST || '0.0.0.0';

app.initialize().listen(PORT, HOST, () => {
    console.log('ProxyLine started: %s:%s, PID %s', HOST, PORT, process.pid);
});
