"use server";

import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/server";

/**
 * Server Action untuk memproses login admin dengan email dan password.
 * Diarahkan ke /admin jika berhasil, atau mengembalikan pesan error jika gagal.
 */
export async function login(prevState, formData) {
  const data = formData instanceof FormData ? formData : prevState;
  const email = data?.get?.("email")?.toString()?.trim();
  const password = data?.get?.("password")?.toString();

  if (!email || !password) {
    return { error: "Email dan password wajib diisi." };
  }

  let supabase;
  try {
    supabase = await createAdminClient();
  } catch (err) {
    return { error: "Gagal menghubungkan ke layanan otentikasi." };
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    if (error.message.includes("Invalid login credentials")) {
      return { error: "Email atau password salah." };
    }
    return { error: error.message || "Gagal masuk. Silakan coba lagi." };
  }

  redirect("/admin");
}

/**
 * Server Action untuk mengakhiri sesi admin (logout) lalu kembali ke halaman login.
 */
export async function keluar() {
  let supabase;
  try {
    supabase = await createAdminClient();
    await supabase.auth.signOut();
  } catch {
    // Tetap lanjutkan pengalihan jika terjadi kendala saat sign out
  }

  redirect("/admin/login");
}

export const logout = keluar;

/**
 * Server Action untuk mengganti password admin yang sedang login.
 * Memvalidasi panjang minimal 8 karakter dan kecocokan dengan konfirmasi.
 */
export async function gantiPassword(prevState, formData) {
  const data = formData instanceof FormData ? formData : prevState;
  const passwordBaru = data?.get?.("password_baru")?.toString();
  const konfirmasiPassword = data?.get?.("konfirmasi_password")?.toString();

  if (!passwordBaru || !konfirmasiPassword) {
    return { error: "Semua kolom password wajib diisi." };
  }

  if (passwordBaru.length < 8) {
    return { error: "Password baru minimal 8 karakter." };
  }

  if (passwordBaru !== konfirmasiPassword) {
    return { error: "Konfirmasi password tidak cocok dengan password baru." };
  }

  let supabase;
  try {
    supabase = await createAdminClient();
  } catch (err) {
    return { error: "Gagal menghubungkan ke layanan otentikasi." };
  }

  // Wajib periksa bahwa admin sudah login sebelum mengubah data (aturan keamanan AGENTS.md)
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: "Sesi telah berakhir atau Anda belum login. Silakan login kembali." };
  }

  const { error } = await supabase.auth.updateUser({
    password: passwordBaru,
  });

  if (error) {
    return { error: error.message || "Gagal mengganti password." };
  }

  return { success: "Password berhasil diganti." };
}

export const changePassword = gantiPassword;
