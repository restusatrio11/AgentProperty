const net = require('net');

const projectRef = 'xcyohwsknjupekdpncqp';
const regions = [
  'ap-southeast-1', // Singapore
  'ap-southeast-2', // Sydney
  'ap-northeast-1', // Tokyo
  'ap-northeast-2', // Seoul
  'ap-south-1',     // Mumbai
  'us-east-1',      // N. Virginia
  'us-east-2',      // Ohio
  'us-west-1',      // N. California
  'us-west-2',      // Oregon
  'eu-central-1',   // Frankfurt
  'eu-west-1',      // Ireland
  'eu-west-2',      // London
  'sa-east-1'       // Sao Paulo
];

function checkRegion(region) {
  return new Promise((resolve) => {
    // Test on port 6543 (transaction pooler)
    const host = `aws-0-${region}.pooler.supabase.com`;
    const port = 6543;
    const socket = new net.Socket();
    
    // Increased timeout to 8 seconds for slow connections
    const timer = setTimeout(() => {
      socket.destroy();
      resolve({ region, status: 'TIMEOUT' });
    }, 8000);

    socket.connect(port, host, () => {
      const userParam = `user\0postgres.${projectRef}\0\0`;
      const len = 8 + userParam.length;
      const buf = Buffer.alloc(len);
      buf.writeInt32BE(len, 0);
      buf.writeInt32BE(196608, 4);
      buf.write(userParam, 8);
      
      socket.write(buf);
    });

    socket.on('data', (data) => {
      clearTimeout(timer);
      const response = data.toString('utf8');
      socket.destroy();
      if (response.includes('tenant/user') && response.includes('not found')) {
        resolve({ region, status: 'NOT_FOUND' });
      } else {
        resolve({ region, status: 'FOUND', response: response.substring(0, 100) });
      }
    });

    socket.on('error', (err) => {
      clearTimeout(timer);
      socket.destroy();
      resolve({ region, status: 'ERROR', error: err.message });
    });
  });
}

async function run() {
  console.log("Checking Supabase regions on port 6543 for project:", projectRef);
  const promises = regions.map(r => checkRegion(r));
  const results = await Promise.all(promises);
  
  let found = false;
  for (const res of results) {
    if (res.status === 'FOUND') {
      console.log(`\n🎉 FOUND correct region: ${res.region}`);
      console.log(`Response snippet: ${res.response}`);
      found = true;
    } else {
      console.log(`Region ${res.region}: ${res.status} ${res.error ? '(' + res.error + ')' : ''}`);
    }
  }
  
  if (!found) {
    console.log("\n❌ No matching region found.");
  }
}

run();
