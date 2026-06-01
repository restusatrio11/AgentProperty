"use client";

import React, { useState } from "react";
import { Search, MapPin, Home, DollarSign } from "lucide-react";
import styles from "./SearchBar.module.css";
import { useRouter } from "next/navigation";

const SearchBar = ({ kawasans = [] }) => {
  const router = useRouter();
  const [filters, setFilters] = useState({
    lokasi: "",
    tipe: "",
    harga: ""
  });

  const handleSearch = (e) => {
    e.preventDefault();
    const query = new URLSearchParams(filters).toString();
    router.push(`/properti?${query}`);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className={styles.searchBarContainer}>
      <form className={styles.searchForm} onSubmit={handleSearch}>
        <div className={styles.inputGroup}>
          <div className={styles.iconWrapper}>
            <MapPin size={18} />
          </div>
          <div className={styles.fieldWrapper}>
            <label>Lokasi</label>
            <select name="lokasi" value={filters.lokasi} onChange={handleChange}>
              <option value="">Semua Lokasi</option>
              {kawasans.map(k => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.divider} />

        <div className={styles.inputGroup}>
          <div className={styles.iconWrapper}>
            <Home size={18} />
          </div>
          <div className={styles.fieldWrapper}>
            <label>Tipe Properti</label>
            <select name="tipe" value={filters.tipe} onChange={handleChange}>
              <option value="">Semua Tipe</option>
              <option value="VILLA">Villa</option>
              <option value="RUKO">Ruko</option>
              <option value="TANAH">Tanah</option>
            </select>
          </div>
        </div>

        <div className={styles.divider} />

        <div className={styles.inputGroup}>
          <div className={styles.iconWrapper}>
            <DollarSign size={18} />
          </div>
          <div className={styles.fieldWrapper}>
            <label>Range Harga</label>
            <select name="harga" value={filters.harga} onChange={handleChange}>
              <option value="">Semua Harga</option>
              <option value="0-1M">&lt; 1 Miliar</option>
              <option value="1M-2M">1 - 2 Miliar</option>
              <option value="2M-5M">2 - 5 Miliar</option>
              <option value="5M+">&gt; 5 Miliar</option>
            </select>
          </div>
        </div>

        <button type="submit" className={styles.searchButton}>
          <Search size={20} />
          <span>Cari</span>
        </button>
      </form>
    </div>
  );
};

export default SearchBar;
