const { PrismaClient, Prisma } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // 1. Create Superadmin
  const email = "superadmin@primeproperty.com";
  // Hashed using bcryptjs with cost factor of 10
  const passwordHash = bcrypt.hashSync("SuperadminPrime123!", 10);
  
  const superadmin = await prisma.user.upsert({
    where: { email },
    update: {
      passwordHash,
      role: "SUPERADMIN",
      isActive: true,
    },
    create: {
      email,
      passwordHash,
      role: "SUPERADMIN",
      isActive: true,
    },
  });

  console.log(`Superadmin user created/updated: ${superadmin.email}`);

  // Clear existing properties and testimonials for clean seed run
  await prisma.property.deleteMany();
  await prisma.testimonial.deleteMany();
  console.log("Cleared existing data.");

  // 2. Generate 55 Property Listings
  const kawasans = ["Krakatau", "Pancing", "Cemara Asri", "Helvetia", "Tembung", "Medan Johor", "Setiabudi"];
  const groups = ["Mentari", "Permai 123", "Project Ville", "Sinar Residence", "Golden Hill", null];
  const directions = [["UTARA"], ["SELATAN"], ["TIMUR"], ["BARAT"], ["TIMUR", "UTARA"], ["BARAT", "SELATAN"]];
  const siapOptions = ["siap_huni", "siap_kosong", "siap_huni_renovasi"];
  const units = ["Ready Siap huni", "Gate siap", "Lapangan", "Rucon", "Hook unit", null];

  const propertiesData = [];

  for (let i = 1; i <= 55; i++) {
    const isVilla = i % 2 === 0;
    const type = isVilla ? "VILLA" : "RUKO";
    
    // Choose group and kawasan
    const groupName = groups[i % groups.length];
    const kawasanVal = kawasans[i % kawasans.length];
    const kawasanJson = JSON.stringify([kawasanVal]);

    // Dimensions
    const lebar = isVilla ? (6 + (i % 5) * 0.5) : (4 + (i % 3) * 0.25); // 6.0 to 8.0 or 4.0 to 4.5
    const panjang = isVilla ? (15 + (i % 4) * 2) : (12 + (i % 5) * 3); // 15 to 21 or 12 to 24
    
    // Hadap (sorted alphabetically)
    const hadapArray = directions[i % directions.length].sort();
    const hadapJson = JSON.stringify(hadapArray);

    // Levels (tingkat)
    const tingkat = isVilla ? (1 + (i % 3) * 0.5) : (2 + (i % 3) * 1); // 1.0 to 2.0 or 2.0 to 4.0

    // Price between 800 million and 5 billion rupiah
    const priceMultiplier = 800000000 + (i * 75000000);
    const price = BigInt(priceMultiplier);

    const carport = i % 3 !== 0;
    const status = i % 7 === 0 ? "sold_out" : "in_stock";
    const siap = siapOptions[i % siapOptions.length];
    const mapsLink = `https://google.com/maps/place/Prime+Property+Unit+${i}`;
    
    // Randomized coordinates around Medan
    const lat = 3.5952 + (Math.random() - 0.5) * 0.1;
    const lng = 98.6722 + (Math.random() - 0.5) * 0.15;
    
    const unit = units[i % units.length];

    const propName = isVilla 
      ? `Villa ${groupName || "Premium"} Indah Blok ${String.fromCharCode(65 + (i % 6))}-${i}`
      : `Ruko Commercial ${groupName || "Central"} Kav ${i}`;

    propertiesData.push({
      namaProperti: propName,
      groupName,
      lebar: new Prisma.Decimal(lebar.toFixed(2)),
      panjang: new Prisma.Decimal(panjang.toFixed(2)),
      hadap: hadapJson,
      tipe: type,
      tingkat: new Prisma.Decimal(tingkat.toFixed(1)),
      price,
      carport,
      status,
      siap,
      mapsLink,
      lat,
      lng,
      kawasan: kawasanJson,
      unit,
      createdById: superadmin.id,
    });
  }

  for (const data of propertiesData) {
    await prisma.property.create({ data });
  }
  console.log(`Successfully seeded ${propertiesData.length} properties.`);

  // 3. Seed Testimonials
  const testimonials = [
    { nama: "Budi Santoso", role: "Pembeli Villa Golden Hill", content: "Pelayanan sangat profesional. Proses akad cepat dan kualitas bangunan benar-benar sesuai dengan yang dijanjikan. Sangat puas!", stars: 5, isApproved: true },
    { nama: "Siska Amelia", role: "Investor Ruko Mentari", content: "Lokasi ruko yang ditawarkan sangat strategis untuk usaha. Nilai sewanya tinggi dan kenaikan harga propertinya sangat signifikan.", stars: 5, isApproved: true },
    { nama: "Hendra Wijaya", role: "Pembeli Sinar Residence", content: "Desain rumahnya modern dan fungsional. Lingkungannya asri dan keamanannya terjaga. Terima kasih Prime Property!", stars: 5, isApproved: true },
    { nama: "Anita Putri", role: "Pengusaha", content: "Sangat terbantu dengan konsultasi KPR-nya. Tim agen sangat sabar menjelaskan detail skema pembayaran hingga deal.", stars: 4, isApproved: true },
    { nama: "Rudi Hermawan", role: "Pembeli Ruko Pancing", content: "Investasi terbaik tahun ini. Unit ruko saya sudah tersewa bahkan sebelum serah terima kunci selesai. Luar biasa!", stars: 5, isApproved: true },
    { nama: "Sari Devi", role: "Ibu Rumah Tangga", content: "Vila yang cantik! Anak-anak sangat senang dengan fasilitas taman dan kolam renangnya. Lingkungannya sangat ramah keluarga.", stars: 5, isApproved: true },
    { nama: "Dr. Anton", role: "Dokter", content: "Keamanan dan privasi adalah prioritas saya, dan Prime Property memberikan solusi hunian yang tepat dengan sistem cluster satu pintu.", stars: 5, isApproved: true },
    { nama: "Linda Wahyuni", role: "Manager", content: "Cemara Asri selalu menjadi impian saya. Berkat Prime Property, saya mendapatkan unit hook terbaik dengan harga yang kompetitif.", stars: 5, isApproved: true }
  ];

  for (const t of testimonials) {
    await prisma.testimonial.create({ data: t });
  }
  console.log(`Successfully seeded ${testimonials.length} testimonials.`);
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
