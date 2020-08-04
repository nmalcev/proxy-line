### ProxyLine
Simple CORS proxy server on node.js

Features:
- Does not require any dependencies;
- It can fix CORS restrictions for cross-domain XHR queries.

#### How to use
``` javascript
const data = {
    protocol: 'https',
    method: 'GET',
    host: 'www.hostname.com',
    path: '/static/path/',
    headers: {
        'accept': '*/*',
        'accept-encoding': 'gzip, deflate, br',
        'accept-language': 'en-US,en;q=0.9,ru;q=0.8,fr;q=0.7',
        'user-agent': 'Mozilla/5.0 (X11; Linux armv7l) AppleWebKit/537.36 (KHTML, like Gecko) Raspbian Chromium/78.0.3904.108 Chrome/78.0.3904.108 Safari/537.36',
    },
};

fetch('http://localhost:61000/request', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'accept': '*/*',
        'accept-encoding': 'gzip, deflate, br',
        'accept-language': 'en-US,en;q=0.9,ru;q=0.8,fr;q=0.7',
        'cache-control': 'max-age=0',
    },
    redirect: 'follow',
    referrerPolicy: 'no-referrer',
    body: JSON.stringify(data)
}).then(resp => {
    resp.text().then((text) => {
        console.log('TEXT');
        console.dir(text);
    });
}).catch(error => {
    console.log('Error');
    console.dir(error);
})
```

### Commands
To start the server: `PORT=9090 MODE="DEBUG" SECRET="{\"u0009\":{\"host\":\".host.com\",\"header\":{\"cookie\":[\"$secret\",\"value\"]}}}" npm run start`
