const app = require('./src/app');
const { setSecretBase } = require('./src/middlewares/pipeMiddleware');

const PORT = process.env.PORT || 61000;
const HOST = process.env.HOST || '0.0.0.0';


if (process.env.MODE === 'DEBUG') {
    app.addInitialMiddleware((req, resp) => {
        console.log('%s %s', req.method, req.url);
    });
}

try {
    const secret = JSON.parse(process.env.SECRET || 'null');
    setSecretBase(secret);
} catch(e) {
    console.warn('Cannot parse the SECRET value');
}

app.initialize().listen(PORT, HOST, () => {
    console.log('ProxyLine started: %s:%s, PID %s, MODE %s', HOST, PORT, process.pid, process.env.MODE);
});
