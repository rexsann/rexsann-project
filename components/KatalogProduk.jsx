"use client";

import { useState, useMemo } from "react";
import KartuProduk from "@/components/KartuProduk";

export default function KatalogProduk({
  daftarProduk = [],
  initialCari = "",
  initialKategori = "Semua",
}) {
  const [cari, setCari] = useState(initialCari);
  const [kategoriDipilih, setKategoriDipilih] = useState(initialKategori);

  // Ambil daftar kategori unik dari data produk yang ada di database
  const daftarKategori = useMemo(() => {
    const kategoriSet = new Set();
    daftarProduk.forEach((p) => {
      if (p.kategori && p.kategori.trim()) {
        kategoriSet.add(p.kategori.trim());
      }
    });
    return ["Semua", ...Array.from(kategoriSet)];
  }, [daftarProduk]);

  const perbaruiUrl = (kataKunci, kategori) => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams();
    if (kataKunci.trim()) params.set("cari", kataKunci.trim());
    if (kategori && kategori !== "Semua") params.set("kategori", kategori);
    const queryString = params.toString();
    window.history.replaceState(null, "", queryString ? `/?${queryString}` : "/");
  };

  const handleCariChange = (e) => {
    const value = e.target.value;
    setCari(value);
    perbaruiUrl(value, kategoriDipilih);
  };

  const handleKategoriClick = (kat) => {
    setKategoriDipilih(kat);
    perbaruiUrl(cari, kat);
  };

  const handleReset = () => {
    setCari("");
    setKategoriDipilih("Semua");
    perbaruiUrl("", "Semua");
  };

  const produkTerfilter = useMemo(() => {
    return daftarProduk.filter((produk) => {
      const cocokKategori =
        kategoriDipilih === "Semua" ||
        (produk.kategori &&
          produk.kategori.trim().toLowerCase() === kategoriDipilih.trim().toLowerCase());

      const query = cari.trim().toLowerCase();
      const cocokCari =
        !query ||
        (produk.nama && produk.nama.toLowerCase().includes(query)) ||
        (produk.deskripsi && produk.deskripsi.toLowerCase().includes(query));

      return cocokKategori && cocokCari;
    });
  }, [daftarProduk, kategoriDipilih, cari]);

  if (daftarProduk.length === 0) {
    return <p className="py-8 text-center text-teks-lembut">Belum ada produk</p>;
  }

  const sedangFilter = cari.trim() !== "" || kategoriDipilih !== "Semua";

  return (
    <div className="flex flex-col gap-6">
      {/* Kolom Pencarian & Filter Kategori */}
      <div className="flex flex-col gap-4">
        {/* Input Pencarian */}
        <div className="relative w-full max-w-md">
          <input
            type="text"
            value={cari}
            onChange={handleCariChange}
            placeholder="Cari nama atau deskripsi produk..."
            className="w-full rounded-xl border border-garis bg-latar px-4 py-2.5 pr-10 text-sm text-teks placeholder:text-teks-lembut focus:border-utama focus:outline-none"
          />
          {cari && (
            <button
              type="button"
              onClick={() => {
                setCari("");
                perbaruiUrl("", kategoriDipilih);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-teks-lembut hover:text-teks"
              title="Hapus pencarian"
            >
              ✕
            </button>
          )}
        </div>

        {/* Tombol Filter Kategori */}
        {daftarKategori.length > 1 && (
          <div className="flex flex-wrap items-center gap-2">
            {daftarKategori.map((kat) => {
              const aktif =
                kat.toLowerCase() === kategoriDipilih.toLowerCase() ||
                (kat === "Semua" && kategoriDipilih === "Semua");
              return (
                <button
                  key={kat}
                  type="button"
                  onClick={() => handleKategoriClick(kat)}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors sm:text-sm ${
                    aktif
                      ? "bg-utama text-white"
                      : "border border-garis bg-latar text-teks hover:border-utama hover:text-utama"
                  }`}
                >
                  {kat}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Indikator Hasil Pencarian / Filter */}
      {sedangFilter && (
        <div className="flex items-center justify-between text-xs text-teks-lembut sm:text-sm">
          <p>
            Ditemukan <span className="font-bold text-teks">{produkTerfilter.length}</span> produk
            {kategoriDipilih !== "Semua" && (
              <>
                {" "}
                dalam kategori &ldquo;
                <span className="font-semibold text-teks">{kategoriDipilih}</span>&rdquo;
              </>
            )}
            {cari.trim() && (
              <>
                {" "}
                untuk kata kunci &ldquo;
                <span className="font-semibold text-teks">{cari.trim()}</span>&rdquo;
              </>
            )}
          </p>
          <button
            type="button"
            onClick={handleReset}
            className="font-semibold text-utama underline underline-offset-4 hover:text-utama-gelap"
          >
            Reset
          </button>
        </div>
      )}

      {/* Grid Produk atau Status Kosong */}
      {produkTerfilter.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {produkTerfilter.map((produk) => (
            <KartuProduk key={produk.id} produk={produk} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-garis bg-permukaan/50 px-4 py-12 text-center">
          <p className="font-bold text-teks">Tidak ada produk yang cocok</p>
          <p className="max-w-sm text-sm text-teks-lembut">
            Tidak ditemukan produk dengan kata kunci atau filter kategori yang dipilih.
          </p>
          <button
            type="button"
            onClick={handleReset}
            className="rounded-lg bg-utama px-4 py-2 text-sm font-semibold text-white hover:bg-utama-gelap"
          >
            Tampilkan semua produk
          </button>
        </div>
      )}
    </div>
  );
}

