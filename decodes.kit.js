module.exports.formDecode = formDecode;
module.exports.urlEncode = urlEncode;
module.exports.getQuery = getQuery;
module.exports.parseDomain = parseDomain;
module.exports.cookieDecode = cookieDecode;
module.exports.CookieManager = CookieManager;


function _fromRfc3986(val){
	var 	tmp = val
			.replace(/%21/g, "!")
			.replace(/%2A/g, "*")
			.replace(/%27/g, "'")
			.replace(/%28/g, "(")
			.replace(/%29/g, ")");

	return decodeURIComponent(tmp);
};
var _3986map = {
		'!': 	'%21',
		'*': 	'%2A',
		'\'': 	'%27',
		'(': 	'%28',
		')': 	'%29',
	},
	_3986backmap = {
		'%21': '!',
		'%2A': '*',
		'%27': '\'',
		'%28': '(',
		'%29': ')',
	};

function toRfc3986(val){
	return encodeURIComponent(val).replace(/[\!\*\'\(\)]/g, function(m){
		return _3986map[m];
	});
};
function fromRfc3986(val){
	return decodeURIComponent(val.replace(/(%21|%2A|%27|%28|%29)/g, function(m){
		return _3986backmap[m];
	}));
};
// @param {String} encoded - something like 'var1=value1&var2=value'
// @return {Object} decoded;
function formDecode(encoded){
	var 	pos, part, eqpos,
			decoded = {},
			prev = 0;
	
	while(pos != -1){
		pos = encoded.indexOf('&', prev);
		part = pos != -1 ? encoded.substring(prev, pos) : encoded.substring(prev);
		eqpos = part.indexOf('=');
		
		if(eqpos != -1){
			decoded[_fromRfc3986(part.substring(0, eqpos))] = _fromRfc3986(part.substring(eqpos + 1));
		}else{
			decoded[_fromRfc3986(part)] = null;
		}
		prev = pos + 1;
	}
	return decoded;
}

function urlEncode(obj){
	var 	out = '', 
			key;

	for(key in obj){
		out += (out.length > 0 ? '&' : '?') + toRfc3986(key) + '=' + toRfc3986(obj[key]);
	}
	return out;
};

function getQuery(url){
	var 	pos = url.indexOf('#');

	if(pos != -1) url = url.substr(0, pos);
	pos = url.indexOf('?');
	return pos != -1 && url.substr(pos + 1);
}

function parseDomain(s){
	var 	pos = s.indexOf(':'),
			out = {
				host: s
			};
	
	if(s == -1){
		out.port = 80;
	}else{
		out.host = s.substring(0, pos);
		out.port = s.substring(pos + 1) - 0;
	}
		
	return out;
}


// @param {String} encoded - cookie string like 'var1=value1;var2=value'
// @return {Object} decoded;
function cookieDecode(encoded){
	var 	pos, part, eqpos,
			decoded = {},
			prev = 0;
	
	while(pos != -1){
		pos = encoded.indexOf(';', prev);
		part = pos != -1 ? encoded.substring(prev, pos) : encoded.substring(prev);
		
		if(part){
			eqpos = part.indexOf('=');
		
			if(eqpos != -1){
				decoded[part.substring(0, eqpos).trim()] = decodeURI(part.substring(eqpos + 1));
			}else{
				decoded[part.trim()] = null;
			}
		}
		prev = pos + 1;
	}
	return decoded;
}

function CookieManager(){
	this.domains = {};
}
// @param {String} domain
// @param {Array} cookies
CookieManager.prototype.add = function(domain, cookies){
	if(!this.domains[domain]){
		this.domains[domain] = {};
	}
	var 	i = cookies.length,
			pos, buf;

	while(i-- > 0){
		pos = cookies[i].indexOf(';');
		buf = pos != -1 ? cookies[i].substring(0, pos) : cookies[i];
		pos = buf.indexOf('=');
		
		if(pos != -1){
			this.domains[domain][buf.substring(0, pos)]	= buf.substring(pos + 1);
		}
	}
};
// @param {String} domain
CookieManager.prototype.get = function(domain){
	var 	collection = this.domains[domain] || {};

	return collection;
};
CookieManager.prototype.getSerialized = function(domain){
	var 	collection = this.domains[domain] || {},
			out = '';

	for(var key in collection){
		out += key + '=' + collection[key] + '; ';
	}

	return out;
};

