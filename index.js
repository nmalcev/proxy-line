var 	$http = require('http'),
		$decodes = require('./decodes.kit');
var 	PORT = 9090;
var		DEFAULT_HOST = '10.3.2.15:2341';


$http.createServer(function(request, response){
	var 	formData,
			conf;
	
	if(request.url.indexOf('?') != -1){
		formData = $decodes.formDecode($decodes.getQuery(request.url) || '');	
	}
	console.log('[REQ] `%s`', request.url);
	console.dir(formData);
	
	conf = $decodes.parseDomain(formData && formData.host || DEFAULT_HOST);
	conf.method = request.method;
	conf.path = request.url;
	conf.headers = request.headers;
	
	var proxy_request = $http.request(conf, function(proxy_response){
		proxy_response.on('data', function(chunk){
			response.write(chunk, 'binary');
		});
		proxy_response.on('end', function(){
			response.end();
		});
		// Fix CORS troubles
		proxy_response.headers['Access-Control-Allow-Origin'] = '*';
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