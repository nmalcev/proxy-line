const $http = require('http');
const $https = require('https');

function configureCertificates() {
	$https.globalAgent.options.ca = require('ssl-root-cas/latest').create();
}


function xrequest(reqData, handler) {
    return (reqData.protocol !== 'https:' ? $http : $https).request(reqData, handler);
}

module.exports = {
    xrequest,
    configureCertificates
};