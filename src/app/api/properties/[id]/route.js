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

// PUT: Update property (Superadmin only)
export async function PUT(request, { params }) {
  try {
    const { id } = params;

    // Role check using DB permissions configuration
    const role = request.headers.get("x-user-role") || "ADMIN";
    if (!await hasPermissionDb(role, RESOURCES.PROPERTIES, ACTIONS.UPDATE)) {
      return NextResponse.json({ error: `Forbidden: Role ${role} tidak memiliki izin untuk mengedit properti.` }, { status: 403 });
    }

    // Fetch existing property
    const existing = await prisma.property.findUnique({
      where: { id },
    });

    if (!existing || existing.deletedAt) {
      return NextResponse.json({ error: "Properti tidak ditemukan." }, { status: 444 });
    }

    const body = await request.json();
    const {
      namaProperti,
      groupName,
      lebar,
      panjang,
      hadap, // Array of strings
      tipe, // "RUKO" | "VILLA"
      tingkat,
      price,
      carport, // boolean
      status, // "in_stock" | "sold_out"
      siap, // "siap_huni" | "siap_kosong" | "siap_huni_renovasi"
      mapsLink,
      lat,
      lng,
      kawasan, // Array of strings
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

    const sortedHadap = JSON.stringify(hadap.map((h) => h.toUpperCase()).sort());
    const sortedKawasan = JSON.stringify(kawasan.map((k) => k.trim()));

    // Track changes for Audit Log
    const changes = [];
    if (existing.namaProperti !== namaProperti.trim()) {
      changes.push(`Nama: "${existing.namaProperti}" -> "${namaProperti.trim()}"`);
    }
    if ((existing.groupName || "") !== (groupName?.trim() || "")) {
      changes.push(`Group: "${existing.groupName || ""}" -> "${groupName?.trim() || ""}"`);
    }
    if (Number(existing.lebar) !== numLebar) {
      changes.push(`Lebar: ${existing.lebar} -> ${numLebar}`);
    }
    if (Number(existing.panjang) !== numPanjang) {
      changes.push(`Panjang: ${existing.panjang} -> ${numPanjang}`);
    }
    if (existing.hadap !== sortedHadap) {
      changes.push(`Hadap: ${existing.hadap} -> ${sortedHadap}`);
    }
    if (existing.tipe !== tipe.toUpperCase()) {
      changes.push(`Tipe: "${existing.tipe}" -> "${tipe.toUpperCase()}"`);
    }
    if (Number(existing.tingkat) !== numTingkat) {
      changes.push(`Tingkat: ${existing.tingkat} -> ${numTingkat}`);
    }
    if (Number(existing.price) !== numPrice) {
      changes.push(`Harga: Rp ${Number(existing.price).toLocaleString("id-ID")} -> Rp ${numPrice.toLocaleString("id-ID")}`);
    }
    if (existing.carport !== !!carport) {
      changes.push(`Carport: ${existing.carport} -> ${!!carport}`);
    }
    if (existing.status !== status) {
      changes.push(`Status: "${existing.status}" -> "${status}"`);
    }
    if (existing.siap !== siap) {
      changes.push(`Siap: "${existing.siap}" -> "${siap}"`);
    }
    if ((existing.mapsLink || "") !== (mapsLink?.trim() || "")) {
      changes.push(`Maps: "${existing.mapsLink || ""}" -> "${mapsLink?.trim() || ""}"`);
    }
    if (existing.lat !== (lat ? parseFloat(lat) : existing.lat)) {
      changes.push(`Lat: ${existing.lat} -> ${lat}`);
    }
    if (existing.lng !== (lng ? parseFloat(lng) : existing.lng)) {
      changes.push(`Lng: ${existing.lng} -> ${lng}`);
    }
    if (existing.kawasan !== sortedKawasan) {
      changes.push(`Kawasan: ${existing.kawasan} -> ${sortedKawasan}`);
    }
    if ((existing.unit || "") !== (unit?.trim() || "")) {
      changes.push(`Unit: "${existing.unit || ""}" -> "${unit?.trim() || ""}"`);
    }

    const hasChanges = changes.length > 0;

    // Perform Update
    const updated = await prisma.property.update({
      where: { id },
      data: {
        namaProperti: namaProperti.trim(),
        groupName: groupName ? groupName.trim() : null,
        lebar: numLebar,
        panjang: numPanjang,
        hadap: sortedHadap,
        tipe: tipe.toUpperCase(),
        tingkat: numTingkat,
        price: BigInt(numPrice),
        carport: !!carport,
        status,
        siap,
        mapsLink: mapsLink ? mapsLink.trim() : null,
        lat: lat ? parseFloat(lat) : null,
        lng: lng ? parseFloat(lng) : null,
        kawasan: sortedKawasan,
        unit: unit ? unit.trim() : null,
      },
    });

    if (hasChanges) {
      // Find superadmin for user context
      let creator = await prisma.user.findFirst({
        where: { role: "SUPERADMIN" },
      });
      if (!creator) {
        creator = await prisma.user.create({
          data: {
            email: "superadmin@primeproperty.com",
            passwordHash: "$2a$10$xyz",
            role: "SUPERADMIN",
          },
        });
      }

      await prisma.auditLog.create({
        data: {
          userId: creator.id,
          actionType: "UPDATE",
          entityName: "Property",
          entityId: updated.id,
          changeSummary: `Memperbarui properti "${updated.namaProperti}". Perubahan: ${changes.join(", ")}`,
          ipAddress: request.headers.get("x-forwarded-for") || "127.0.0.1",
        },
      });
    }

    return NextResponse.json({
      message: "Properti berhasil diperbarui.",
      property: serializeProperty(updated),
    });
  } catch (error) {
    console.error("PUT /api/properties/[id] error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server saat memperbarui properti." }, { status: 500 });
  }
}

// DELETE: Soft delete property (Superadmin only)
export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    // Role check using DB permissions configuration
    const role = request.headers.get("x-user-role") || "ADMIN";
    if (!await hasPermissionDb(role, RESOURCES.PROPERTIES, ACTIONS.DELETE)) {
      return NextResponse.json({ error: `Forbidden: Role ${role} tidak memiliki izin untuk menghapus properti.` }, { status: 403 });
    }

    // Fetch existing
    const existing = await prisma.property.findUnique({
      where: { id },
    });

    if (!existing || existing.deletedAt) {
      return NextResponse.json({ error: "Properti tidak ditemukan atau sudah dihapus." }, { status: 404 });
    }

    // Soft delete
    const deleted = await prisma.property.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });

    // Audit log
    let creator = await prisma.user.findFirst({
      where: { role: "SUPERADMIN" },
    });
    if (!creator) {
      creator = await prisma.user.create({
        data: {
          email: "superadmin@primeproperty.com",
          passwordHash: "$2a$10$xyz",
          role: "SUPERADMIN",
        },
      });
    }

    await prisma.auditLog.create({
      data: {
        userId: creator.id,
        actionType: "DELETE",
        entityName: "Property",
        entityId: deleted.id,
        changeSummary: `Menghapus properti "${deleted.namaProperti}" (Soft Delete)`,
        ipAddress: request.headers.get("x-forwarded-for") || "127.0.0.1",
      },
    });

    return NextResponse.json({
      message: `Properti "${deleted.namaProperti}" berhasil dihapus.`,
      id: deleted.id,
    });
  } catch (error) {
    console.error("DELETE /api/properties/[id] error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server saat menghapus properti." }, { status: 500 });
  }
}

// PATCH: Restore soft-deleted property (Superadmin only)
export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    const role = request.headers.get("x-user-role") || "ADMIN";

    if (!await hasPermissionDb(role, RESOURCES.PROPERTIES, ACTIONS.DELETE)) {
      return NextResponse.json({ error: `Forbidden: Role ${role} tidak memiliki izin untuk memulihkan properti.` }, { status: 403 });
    }

    const restored = await prisma.property.update({
      where: { id },
      data: { deletedAt: null },
    });

    // Audit log
    const creator = await prisma.user.findFirst({ where: { role: "SUPERADMIN" } });
    if (creator) {
      await prisma.auditLog.create({
        data: {
          userId: creator.id,
          actionType: "RESTORE",
          entityName: "Property",
          entityId: restored.id,
          changeSummary: `Memulihkan properti "${restored.namaProperti}" dari arsip.`,
          ipAddress: request.headers.get("x-forwarded-for") || "127.0.0.1",
        },
      });
    }

    return NextResponse.json({
      message: `Properti "${restored.namaProperti}" berhasil dipulihkan.`,
      property: serializeProperty(restored),
    });
  } catch (error) {
    console.error("PATCH /api/properties/[id] restore error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server saat memulihkan properti." }, { status: 500 });
  }
}
