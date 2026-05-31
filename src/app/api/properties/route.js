import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ACTIONS, RESOURCES } from "@/lib/rbac";
import { hasPermissionDb } from "@/lib/rbac-db";

// Helper to convert Prisma types (Decimal, BigInt) to standard numbers/strings
function serializeProperty(prop) {
  let hadapArr = [];
  try {
    hadapArr = JSON.parse(prop.hadap);
  } catch (e) {
    hadapArr = [prop.hadap];
  }

  let kawasanArr = [];
  try {
    kawasanArr = JSON.parse(prop.kawasan);
  } catch (e) {
    kawasanArr = [prop.kawasan];
  }

  return {
    ...prop,
    lebar: Number(prop.lebar),
    panjang: Number(prop.panjang),
    tingkat: Number(prop.tingkat),
    price: Number(prop.price),
    hadap: hadapArr,
    kawasan: kawasanArr,
  };
}

// GET: Fetch list of properties with filters
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.toLowerCase() || "";
    const kawasanParam = searchParams.get("kawasan"); // comma separated
    const lebarMin = parseFloat(searchParams.get("lebarMin") || "0");
    const hadapParam = searchParams.get("hadap"); // comma separated
    const priceMax = parseFloat(searchParams.get("priceMax") || "0");
    const tipe = searchParams.get("tipe") || "Semua"; // Semua, RUKO, VILLA
    const status = searchParams.get("status") || "Semua"; // Semua, in_stock, sold_out
    const siapParam = searchParams.get("siap"); // comma separated
    const carport = searchParams.get("carport") || "Semua"; // Semua, Ya, Tidak
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const showDeleted = searchParams.get("showDeleted") === "true";

    // Fetch properties
    const properties = await prisma.property.findMany({
      where: {
        deletedAt: showDeleted ? { not: null } : null,
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
      include: {
        createdBy: {
          select: {
            email: true,
          }
        }
      }
    });

    // Filter in-memory for rich criteria matching and flexible stringified JSON checks
    let filtered = properties.map(serializeProperty);

    if (search) {
      filtered = filtered.filter((p) => {
        const nameMatch = p.namaProperti?.toLowerCase().includes(search);
        const groupMatch = p.groupName?.toLowerCase().includes(search);
        const kawasanMatch = p.kawasan?.some((k) => k.toLowerCase().includes(search));
        return nameMatch || groupMatch || kawasanMatch;
      });
    }

    if (kawasanParam) {
      const kawasans = kawasanParam.split(",").map((k) => k.trim().toLowerCase());
      if (kawasans.length > 0) {
        filtered = filtered.filter((p) =>
          p.kawasan?.some((k) => kawasans.includes(k.toLowerCase()))
        );
      }
    }

    if (lebarMin > 0) {
      filtered = filtered.filter((p) => p.lebar >= lebarMin);
    }

    if (hadapParam) {
      const hadaps = hadapParam.split(",").map((h) => h.trim().toLowerCase());
      if (hadaps.length > 0) {
        filtered = filtered.filter((p) =>
          p.hadap?.some((h) => hadaps.includes(h.toLowerCase()))
        );
      }
    }

    if (priceMax > 0) {
      filtered = filtered.filter((p) => p.price <= priceMax);
    }

    if (tipe !== "Semua") {
      filtered = filtered.filter((p) => p.tipe === tipe.toUpperCase());
    }

    if (status !== "Semua") {
      filtered = filtered.filter((p) => p.status === status);
    }

    if (siapParam) {
      const siapOptions = siapParam.split(",").map((s) => s.trim().toLowerCase());
      if (siapOptions.length > 0) {
        filtered = filtered.filter((p) => siapOptions.includes(p.siap.toLowerCase()));
      }
    }

    if (carport !== "Semua") {
      const wantCarport = carport === "Ya";
      filtered = filtered.filter((p) => p.carport === wantCarport);
    }

    return NextResponse.json({ properties: filtered }, { status: 200 });
  } catch (error) {
    console.error("GET /api/properties error:", error);
    return NextResponse.json({ error: "Failed to fetch properties" }, { status: 500 });
  }
}

// POST: Create a property (Superadmin only)
export async function POST(request) {
  try {
    // Role check using RBAC module
    const role = request.headers.get("x-user-role") || "ADMIN";
    const userId = request.headers.get("x-user-id");

    if (!await hasPermissionDb(role, RESOURCES.PROPERTIES, ACTIONS.CREATE)) {
      return NextResponse.json(
        { error: `Forbidden: Role ${role} tidak memiliki izin untuk membuat properti.` },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      namaProperti,
      groupName,
      lebar,
      panjang,
      hadap, // Array of strings, e.g. ["UTARA"]
      tipe, // "RUKO" | "VILLA"
      tingkat,
      price, // numeric
      carport, // boolean
      status, // "in_stock" | "sold_out"
      siap, // "siap_huni" | "siap_kosong" | "siap_huni_renovasi"
      mapsLink,
      lat,
      lng,
      kawasan, // Array of strings, e.g. ["Krakatau"]
      unit,
    } = body;

    // Validation
    const errors = {};
    if (!namaProperti || namaProperti.trim().length < 3 || namaProperti.trim().length > 100) {
      errors.namaProperti = "Nama properti wajib diisi (3 - 100 karakter).";
    }
    const numLebar = parseFloat(lebar);
    if (isNaN(numLebar) || numLebar <= 0) {
      errors.lebar = "Lebar harus berupa angka lebih besar dari 0.";
    }
    const numPanjang = parseFloat(panjang);
    if (isNaN(numPanjang) || numPanjang <= 0) {
      errors.panjang = "Panjang harus berupa angka lebih besar dari 0.";
    }
    if (!hadap || !Array.isArray(hadap) || hadap.length === 0) {
      errors.hadap = "Pilih minimal satu hadap.";
    }
    if (tipe !== "RUKO" && tipe !== "VILLA") {
      errors.tipe = "Tipe properti harus Ruko atau Villa.";
    }
    const numTingkat = parseFloat(tingkat);
    if (isNaN(numTingkat) || numTingkat < 1 || numTingkat > 10) {
      errors.tingkat = "Tingkat harus antara 1 dan 10.";
    }
    const numPrice = parseInt(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      errors.price = "Harga harus berupa angka lebih besar dari 0.";
    }
    if (status !== "in_stock" && status !== "sold_out") {
      errors.status = "Status tidak valid.";
    }
    if (!["siap_huni", "siap_kosong", "siap_huni_renovasi"].includes(siap)) {
      errors.siap = "Status kesiapan tidak valid.";
    }
    if (mapsLink && !mapsLink.includes("google.com/maps")) {
      errors.mapsLink = "Link Google Maps harus URL valid yang berisi 'google.com/maps'.";
    }
    if (!kawasan || !Array.isArray(kawasan) || kawasan.length === 0) {
      errors.kawasan = "Pilih minimal satu kawasan.";
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    // Get the actual user ID from header
    let creatorId = userId;
    
    if (!creatorId) {
      // Fallback: search for a superadmin if header is missing
      const creator = await prisma.user.findFirst({
        where: { role: "SUPERADMIN" },
      });
      creatorId = creator?.id;
    }

    if (!creatorId) {
      return NextResponse.json({ error: "Unauthorized: User context not found." }, { status: 401 });
    }

    // Create property
    const newProperty = await prisma.property.create({
      data: {
        namaProperti: namaProperti.trim(),
        groupName: groupName ? groupName.trim() : null,
        lebar: numLebar,
        panjang: numPanjang,
        hadap: JSON.stringify(hadap.map((h) => h.toUpperCase()).sort()),
        tipe: tipe.toUpperCase(),
        tingkat: numTingkat,
        price: BigInt(numPrice),
        carport: !!carport,
        status,
        siap,
        mapsLink: mapsLink ? mapsLink.trim() : null,
        lat: lat ? parseFloat(lat) : 3.5952,
        lng: lng ? parseFloat(lng) : 98.6722,
        kawasan: JSON.stringify(kawasan.map((k) => k.trim())),
        unit: unit ? unit.trim() : null,
        createdById: creatorId,
      },
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        userId: creatorId,
        actionType: "CREATE",
        entityName: "Property",
        entityId: newProperty.id,
        changeSummary: `Membuat properti baru "${newProperty.namaProperti}" dengan harga Rp ${numPrice.toLocaleString("id-ID")}`,
        ipAddress: request.headers.get("x-forwarded-for") || "127.0.0.1",
      },
    });

    return NextResponse.json(
      {
        message: "Properti berhasil ditambahkan.",
        property: serializeProperty(newProperty),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/properties error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server saat menyimpan properti." }, { status: 500 });
  }
}

// DELETE: Bulk delete properties (Superadmin/authorized only)
export async function DELETE(request) {
  try {
    const role = request.headers.get("x-user-role") || "ADMIN";
    const userId = request.headers.get("x-user-id");

    if (!await hasPermissionDb(role, RESOURCES.PROPERTIES, ACTIONS.DELETE)) {
      return NextResponse.json(
        { error: `Forbidden: Role ${role} tidak memiliki izin untuk menghapus properti.` },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "IDs properti tidak valid atau kosong." }, { status: 400 });
    }

    const now = new Date();
    await prisma.property.updateMany({
      where: {
        id: { in: ids },
      },
      data: {
        deletedAt: now,
      },
    });

    let creatorId = userId;
    if (!creatorId) {
      const creator = await prisma.user.findFirst({
        where: { role: "SUPERADMIN" },
      });
      creatorId = creator?.id;
    }

    if (creatorId) {
      await prisma.auditLog.create({
        data: {
          userId: creatorId,
          actionType: "DELETE",
          entityName: "Property",
          entityId: ids.slice(0, 5).join(", ") + (ids.length > 5 ? "..." : ""),
          changeSummary: `Menghapus massal (bulk delete) ${ids.length} properti secara soft-delete.`,
          ipAddress: request.headers.get("x-forwarded-for") || "127.0.0.1",
        },
      });
    }

    return NextResponse.json({ message: `Berhasil menghapus ${ids.length} properti.` }, { status: 200 });
  } catch (error) {
    console.error("DELETE /api/properties bulk error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server saat menghapus massal properti." }, { status: 500 });
  }
}
