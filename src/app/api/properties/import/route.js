import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ACTIONS, RESOURCES } from "@/lib/rbac";
import { hasPermissionDb } from "@/lib/rbac-db";

export async function POST(request) {
  try {
    const role = request.headers.get("x-user-role") || "ADMIN";
    const userId = request.headers.get("x-user-id");

    if (!await hasPermissionDb(role, RESOURCES.PROPERTIES, ACTIONS.CREATE)) {
      return NextResponse.json(
        { error: `Forbidden: Role ${role} tidak memiliki izin untuk mengimpor properti.` },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { properties } = body; // Array of property objects

    if (!properties || !Array.isArray(properties) || properties.length === 0) {
      return NextResponse.json({ error: "Data properti impor tidak valid atau kosong." }, { status: 400 });
    }

    let creatorId = userId;
    if (!creatorId) {
      const creator = await prisma.user.findFirst({
        where: { role: "SUPERADMIN" },
      });
      creatorId = creator?.id;
    }

    if (!creatorId) {
      return NextResponse.json({ error: "Unauthorized: User context not found." }, { status: 401 });
    }

    // Run transaction of creates
    const createdProperties = await prisma.$transaction(
      properties.map((p) => {
        // Normalize fields
        const numLebar = parseFloat(p.lebar) || 0;
        const numPanjang = parseFloat(p.panjang) || 0;
        const numTingkat = parseFloat(p.tingkat) || 1;
        const numPrice = parseInt(p.price) || 0;
        
        let hadapArr = [];
        if (Array.isArray(p.hadap)) {
          hadapArr = p.hadap;
        } else if (p.hadap) {
          hadapArr = p.hadap.split(",").map(h => h.trim().toUpperCase());
        }

        let kawasanArr = [];
        if (Array.isArray(p.kawasan)) {
          kawasanArr = p.kawasan;
        } else if (p.kawasan) {
          kawasanArr = p.kawasan.split(",").map(k => k.trim());
        }

        return prisma.property.create({
          data: {
            namaProperti: p.namaProperti.trim(),
            groupName: p.groupName ? p.groupName.trim() : null,
            lebar: numLebar,
            panjang: numPanjang,
            hadap: JSON.stringify(hadapArr.sort()),
            tipe: (p.tipe || "RUKO").toUpperCase(),
            tingkat: numTingkat,
            price: BigInt(numPrice),
            carport: typeof p.carport === "boolean" ? p.carport : p.carport === "true" || p.carport === "Ya",
            status: p.status || "in_stock",
            siap: p.siap || "siap_huni",
            mapsLink: p.mapsLink ? p.mapsLink.trim() : null,
            kawasan: JSON.stringify(kawasanArr),
            unit: p.unit ? p.unit.trim() : null,
            createdById: creatorId,
          }
        });
      })
    );

    // Write audit log
    await prisma.auditLog.create({
      data: {
        userId: creatorId,
        actionType: "CREATE",
        entityName: "Property",
        entityId: createdProperties.slice(0, 5).map(p => p.id).join(", ") + (createdProperties.length > 5 ? "..." : ""),
        changeSummary: `Mengimpor massal (bulk import) ${createdProperties.length} properti baru dari CSV.`,
        ipAddress: request.headers.get("x-forwarded-for") || "127.0.0.1",
      },
    });

    return NextResponse.json({ 
      message: `Berhasil mengimpor ${createdProperties.length} properti.`,
      count: createdProperties.length
    }, { status: 201 });

  } catch (error) {
    console.error("POST /api/properties/import error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server saat mengimpor properti." }, { status: 500 });
  }
}
