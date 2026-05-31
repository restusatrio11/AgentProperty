const { PrismaClient } = require('@prisma/client');

const projectRef = 'xcyohwsknjupekdpncqp';
// We use their password they saved in .env
const rawPassword = 'agentproperty123oke!ok!'; 
const encodedPassword = encodeURIComponent(rawPassword);

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

async function testConnection(region) {
  const url = `postgresql://postgres.${projectRef}:${encodedPassword}@aws-0-${region}.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1`;
  const prisma = new PrismaClient({
    datasources: {
      db: { url }
    }
  });

  try {
    // Try to run a simple query
    await prisma.$queryRaw`SELECT 1`;
    await prisma.$disconnect();
    return { region, success: true };
  } catch (err) {
    await prisma.$disconnect();
    return { region, success: false, error: err.message || err };
  }
}

async function run() {
  console.log("Probing regions with Prisma...");
  for (const region of regions) {
    process.stdout.write(`Testing ${region}... `);
    const res = await testConnection(region);
    if (res.success) {
      console.log(`\n\n🎉 SUCCESS! Connected to region: ${region}`);
      console.log(`Use this DATABASE_URL:`);
      console.log(`postgresql://postgres.${projectRef}:[YOUR_PASSWORD]@aws-0-${region}.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1`);
      process.exit(0);
    } else {
      // Clean up error message to print concisely
      let errMsg = String(res.error).replace(/\n/g, ' ');
      if (errMsg.includes('Tenant or user not found')) {
        console.log("Tenant not found");
      } else if (errMsg.includes('Authentication failed')) {
        console.log("Authentication failed (Wrong Password)");
      } else if (errMsg.includes('Can\'t reach database server')) {
        console.log("Host unreachable (Timeout/Port blocked)");
      } else {
        console.log(`Failed: ${errMsg.substring(0, 120)}`);
      }
    }
  }
  console.log("\n❌ All regions failed. Double-check project reference, password, or internet connection.");
}

run();
