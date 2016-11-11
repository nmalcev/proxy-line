var 	$http = require('http'),
		$decodes = require('./decodes.kit');


var 	PORT = 9090,
//		DEFAULT_HOST = '10.3.2.15:2341',
		DEFAULT_HOST = '10.3.2.77:2341',
		COOKIE_MARK = 'monkey_proxy_host',
		QUERY_MARK = 'monkeyhost',
		DEBUG = true;


$http.createServer(function(request, response){
	var 	hostDestination,
			conf;
	
	DEBUG && console.log('[REQ] `%s` %s', request.url, new Date());
//	DEBUG && console.dir(request);	
	
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
	
//	console.log('CONF %s', hostDestination);
//	console.dir(conf);
	
	var proxy_request = $http.request(conf, function(proxy_response){
		proxy_response.on('data', function(chunk){
			response.write(chunk, 'binary');
		});
		proxy_response.on('end', function(){
			response.end();
		});
		// Fix CORS troubles
		proxy_response.headers['Access-Control-Allow-Origin'] = '*';
		proxy_response.headers['Access-Control-Allow-Methods'] = 'PROPFIND, PROPPATCH, COPY, MOVE, DELETE, MKCOL, LOCK, UNLOCK, PUT, GETLIB, VERSION-CONTROL, CHECKIN, CHECKOUT, UNCHECKOUT, REPORT, UPDATE, CANCELUPLOAD, HEAD, OPTIONS, GET, POST';
		proxy_response.headers['Access-Control-Allow-Headers'] = 'Overwrite, Destination, Content-Type, Depth, User-Agent, X-File-Size, X-Requested-With, If-Modified-Since, X-File-Name, Cache-Control';
		
		if(hostDestination){
			if(proxy_response.headers['Set-Cookie']){
				proxy_response.headers['Set-Cookie'] += ';' + COOKIE_MARK + '=' + encodeURI(hostDestination);
			}else{
				proxy_response.headers['Set-Cookie'] = COOKIE_MARK + '=' + encodeURI(hostDestination);
			}
			console.log('SET COOKIE `%s`', proxy_response.headers['Set-Cookie']);
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