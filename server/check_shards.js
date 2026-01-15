const dns = require('dns');
const host = 'managementdb.dcqsomw.mongodb.net';

dns.resolveSrv('_mongodb._tcp.' + host, (err, addresses) => {
    if (err) {
        console.error('Error resolving SRV:', err);
        return;
    }
    console.log('Resolved Shards:');
    addresses.forEach(addr => {
        console.log(`${addr.name}:${addr.port}`);
    });
});
