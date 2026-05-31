import React from "react";
import PropertyListingClient from "./PropertyListingClient";

export const metadata = {
  title: "Katalog Properti Premium | Villa Mewah & Ruko Strategis",
  description: "Jelajahi pilihan ruko komersial dan villa eksklusif di Medan. Filter berdasarkan lokasi, tipe, dan harga untuk menemukan properti impian Anda.",
  openGraph: {
    title: "Katalog Properti Prime Property",
    description: "Cari properti premium terbaik di lokasi strategis.",
    images: ["/logo.png"],
  },
};

export default function PropertyListingPage() {
  return (
    <PropertyListingClient />
  );
}
