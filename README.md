### proxy_monkey
Simple proxy server on node.js

Features:
- lightware and without any dependencies;
- can fix CORS for crossdomain xhr requests.

#### How to use
When you open at browser first time http://localhost:9090/?monkeyhost=10.3.2.15:2341  you will be navigated on request path from host that was writen at `monkeyhost` query option.
Also, after request browser save cookie with destination host, so you don't need to  define destination host every time you send request.

Run at console
```
#: node index.js
> LISTEN: 9090
```