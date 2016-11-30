### proxy_monkey
Simple proxy server on node.js

Features:
- lightware and without any dependencies;
- can fix CORS for crossdomain xhr requests.

#### How to use
When you open at browser first time http://localhost:9090/?monkeyhost=10.3.2.15:2341  you will be navigated on request path from host that was writen at `monkeyhost` query option.
Also, after request browser save cookie with destination host, so you don't need to  define destination host every time you send request.

#### Attentions
- There are preflight request with OPTIONS method which is sending before cross domain xml http request(xhr). [Read at MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Access_control_CORS#Preflighted_requests) [Read at stackoverflow](http://stackoverflow.com/questions/1256593/why-am-i-getting-an-options-request-instead-of-a-get-request#answer-13030629)

Run at console
```
#: node index.js
> LISTEN: 9090
```