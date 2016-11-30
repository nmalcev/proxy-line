var 	$http = require('http'),
		$decodes = require('./decodes.kit');


var 	PORT = 9090,
		DEFAULT_HOST = '10.3.2.15:2345',
		COOKIE_MARK = 'monkey_proxy_host',
		QUERY_MARK = 'monkeyhost',
		DEBUG = true;


$http.createServer(function(request, response){
	DEBUG && console.log('[REQ %s] `%s` %s', request.method, request.url, +new Date());

	if(request.method == 'OPTIONS'){ // it is preflight request
   		response.writeHead(200, {  
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'PROPFIND, PROPPATCH, COPY, MOVE, DELETE, MKCOL, LOCK, UNLOCK, PUT, GETLIB, VERSION-CONTROL, CHECKIN, CHECKOUT, UNCHECKOUT, REPORT, UPDATE, CANCELUPLOAD, HEAD, OPTIONS, GET, POST',
			'Access-Control-Allow-Headers': 'Overwrite, Destination, Content-Type, Depth, User-Agent, X-File-Size, X-Requested-With, If-Modified-Since, X-File-Name, Cache-Control',
			'Access-Control-Max-Age': 600, // 600s maximum at Chrome and 86400s at Firefox
			'Content-Type': 'application/json'
		});
		response.end();
		return;
	}

	var 	hostDestination,
			conf;
	
	
	if(request.url.indexOf('?') != -1){
		var queryData = $decodes.formDecode($decodes.getQuery(request.url) || '');	
		hostDestination = queryData[QUERY_MARK];

		DEBUG && console.log('Query');
		DEBUG && console.dir(queryData);
	}else{
		var cookies = $decodes.cookieDecode(request.headers.cookie || '');
		hostDestination = cookies[COOKIE_MARK];
		
		DEBUG && console.log('COOKIE');
		DEBUG && console.dir(cookies);
	}
	
	conf = $decodes.parseDomain(hostDestination || DEFAULT_HOST);
	conf.method = request.method;
	conf.path = request.url;
	conf.headers = request.headers;

	console.log('CONF %s', hostDestination);
	console.dir(conf);
	
	var proxy_request = $http.request(conf, function(proxy_response){
		proxy_response.on('data', function(chunk){
			response.write(chunk, 'binary');
		});
		proxy_response.on('end', function(){
			response.end();
		});

		// if(conf.method == 'OPTIONS'){ // it is preflight request
		// 	proxy_response.headers['Access-Control-Max-Age'] = '600'; // 600s maximum at Chrome and 86400s at Firefox
		// 	// Read more about: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Max-Age
		// 	proxy_response.headers['Access-Control-Allow-Methods'] = 'PROPFIND, PROPPATCH, COPY, MOVE, DELETE, MKCOL, LOCK, UNLOCK, PUT, GETLIB, VERSION-CONTROL, CHECKIN, CHECKOUT, UNCHECKOUT, REPORT, UPDATE, CANCELUPLOAD, HEAD, OPTIONS, GET, POST';
		// 	proxy_response.headers['Access-Control-Allow-Headers'] = 'Overwrite, Destination, Content-Type, Depth, User-Agent, X-File-Size, X-Requested-With, If-Modified-Since, X-File-Name, Cache-Control'; 
		// }
		// Fix CORS troubles
		proxy_response.headers['Access-Control-Allow-Origin'] = '*';
		// Maybe unused
		// proxy_response.headers['Access-Control-Allow-Methods'] = 'PROPFIND, PROPPATCH, COPY, MOVE, DELETE, MKCOL, LOCK, UNLOCK, PUT, GETLIB, VERSION-CONTROL, CHECKIN, CHECKOUT, UNCHECKOUT, REPORT, UPDATE, CANCELUPLOAD, HEAD, OPTIONS, GET, POST';
		// proxy_response.headers['Access-Control-Allow-Headers'] = 'Overwrite, Destination, Content-Type, Depth, User-Agent, X-File-Size, X-Requested-With, If-Modified-Since, X-File-Name, Cache-Control';
		
		if(hostDestination){
			if(proxy_response.headers['Set-Cookie']){
				proxy_response.headers['Set-Cookie'] += ';' + COOKIE_MARK + '=' + encodeURI(hostDestination);
			}else{
				proxy_response.headers['Set-Cookie'] = COOKIE_MARK + '=' + encodeURI(hostDestination);
			}
			DEBUG && console.log('SET COOKIE `%s`', proxy_response.headers['Set-Cookie']);
		}
	
		response.writeHead(proxy_response.statusCode, proxy_response.headers);
	});
	// Handle if host not found
	proxy_request.on('error', function(err){
		response.write(err + '', 'binary');
		response.end();
	});
	request.addListener('data', function(chunk) {
		proxy_request.write(chunk, 'binary');
	});
	request.addListener('end', function() {
		proxy_request.end();
	});
}).listen(PORT);

console.log('LISTEN: %s', PORT);