var config = {};

// In hosted environments it is often difficult to query what the 
// staticIP was that then redirected the request to the location this is running
// Therefore its easier to set a deployment variable for DNS resolution.
config.hostname = <TO ADD ON DEPLOYMENT>

// openDNS
config.dnsServers = ['208.67.222.222','208.67.220.220'];


module.exports = config;
