const Application = require('./src/core/app');
const notFoundMiddleware = require('./src/middlewares/notFound');
const corsMiddleware = require('./src/middlewares/corsMiddleware');
const pipeMiddleware = require('./src/middlewares/pipeMiddleware');


const app = new Application();

app.addMiddleware(corsMiddleware);

app.addMiddleware((req, resp) => {
    if (req.method === 'GET' && req.url === '/test') {
        resp.writeHead(200, 'OK', { 'Content-Type': 'text/html' });
        resp.write('<h1>Still work</h1>');
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

app.initialize().listen(PORT);
console.log('START: %s', PORT);
