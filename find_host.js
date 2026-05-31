const dns = require('dns');

const hosts = [
  'aws-0-ap-northeast-1.pooler.supabase.com',
  'aws-1-ap-northeast-1.pooler.supabase.com',
  'aws-2-ap-northeast-1.pooler.supabase.com',
  'aws-3-ap-northeast-1.pooler.supabase.com',
  'gcp-0-ap-northeast-1.pooler.supabase.com',
  'gcp-1-ap-northeast-1.pooler.supabase.com',
  'aws-0-ap-southeast-1.pooler.supabase.com',
  'aws-1-ap-southeast-1.pooler.supabase.com'
];

function lookup(host) {
  return new Promise((resolve) => {
    dns.lookup(host, (err, address) => {
      if (err) {
        resolve({ host, success: false, error: err.code });
      } else {
        resolve({ host, success: true, address });
      }
    });
  });
}

async function run() {
  console.log("Looking up hostnames in DNS...");
  const promises = hosts.map(h => lookup(h));
  const results = await Promise.all(promises);
  for (const res of results) {
    if (res.success) {
      console.log(`✅ RESOLVES: ${res.host} -> ${res.address}`);
    } else {
      console.log(`❌ ENOTFOUND: ${res.host}`);
    }
  }
}

run();
