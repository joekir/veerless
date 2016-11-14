var config = {};

// In hosted environments it is often difficult to query what the
// staticIP was that then redirected the request to the location this is running
// Therefore its easier to set a deployment variable for DNS resolution.
config.hostname = 'veerless.test';
config.port = '4000';

// openDNS
config.dnsServers = ['208.67.222.222','208.67.220.220'];

// Environment setting
// options ['development','production']
config.environment = 'development';

config.cookieSecret = '2f03f28273c383e5';
 // In a production app this number could be 1000
 // allowing 1000 authenticated transactions before requiring reauth.
config.sessionLimit = 5;

module.exports = config;
