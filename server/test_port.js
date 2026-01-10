const net = require('net');

const host = 'ac-ogvdy4k-shard-00-00.dcqsomw.mongodb.net'; // One of the servers found in DNS
const port = 27017;

console.log(`\n🕵️ NETWORK TEST: Checking if your internet allows connections to Port ${port}...`);
console.log(`Target: ${host}:${port}\n`);

const socket = new net.Socket();
socket.setTimeout(5000);

socket.on('connect', () => {
    console.log('✅ PORT 27017 IS OPEN! Your internet allows MongoDB connections.');
    console.log('   (This means the issue is likely a code/library caching issue)\n');
    socket.destroy();
    process.exit(0);
});

socket.on('timeout', () => {
    console.log('❌ TIMEOUT: The connection took too long.');
    console.log('   Your Internet Service Provider (ISP) or Firewall might be blocking Port 27017.');
    console.log('   Try connecting via a Mobile Hotspot to confirm.\n');
    socket.destroy();
    process.exit(1);
});

socket.on('error', (err) => {
    console.log('❌ CONNECTION FAILED: ' + err.message);
    console.log('   Your Internet Service Provider (ISP) or Router is likely blocking MongoDB.');
    console.log('   Solution: Try using a VPN or Mobile Hotspot.\n');
    process.exit(1);
});

socket.connect(port, host);
