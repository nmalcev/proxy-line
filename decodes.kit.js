module.exports.formDecode = formDecode;
module.exports.getQuery = getQuery;
module.exports.parseDomain = parseDomain;

function fromRfc3986(val){
	var 	tmp = val
			.replace(/%21/g, "!")
			.replace(/%2A/g, "*")
			.replace(/%27/g, "'")
			.replace(/%28/g, "(")
			.replace(/%29/g, ")");

	return decodeURIComponent(tmp);
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
			decoded[fromRfc3986(part.substring(0, eqpos))] = fromRfc3986(part.substring(eqpos + 1));
		}else{
			decoded[fromRfc3986(part)] = null;
		}
		prev = pos + 1;
	}
	return decoded;
}

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