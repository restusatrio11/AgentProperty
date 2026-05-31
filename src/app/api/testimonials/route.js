import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET: Ambil testimoni
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const all = searchParams.get("all") === "true";
    const role = request.headers.get("x-user-role");

    // Jika bukan admin/superadmin, paksa hanya yang approved
    const where = (all && (role === "SUPERADMIN" || role === "ADMIN")) 
      ? {} 
      : { isApproved: true };

    const testimonials = await prisma.testimonial.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ testimonials });
  } catch (error) {
    console.error("Error fetching testimonials:", error);
    return NextResponse.json({ error: "Gagal mengambil data testimoni" }, { status: 500 });
  }
}

// POST: Kirim feedback baru dari publik (Default isApproved: false)
export async function POST(req) {
  try {
    const body = await req.json();
    const { nama, role, content, stars } = body;

    if (!nama || !content) {
      return NextResponse.json({ error: "Nama dan pesan wajib diisi" }, { status: 400 });
    }

    const newTestimonial = await prisma.testimonial.create({
      data: {
        nama,
        role: role || "Pelanggan",
        content,
        stars: parseInt(stars) || 5,
        isApproved: false, // Perlu persetujuan admin
      },
    });

    return NextResponse.json({ 
      message: "Terima kasih atas feedback Anda! Testimoni akan muncul setelah ditinjau oleh admin.",
      testimonial: newTestimonial 
    });
  } catch (error) {
    console.error("Error creating testimonial:", error);
    return NextResponse.json({ error: "Gagal mengirim feedback" }, { status: 500 });
  }
}
// Force dynamic execution for this route
export const dynamic = 'force-dynamic';
