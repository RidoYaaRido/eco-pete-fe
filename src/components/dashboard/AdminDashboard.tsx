// src/components/dashboard/AdminDashboard.tsx
'use client';

// PERBAIKAN: Impor hook yang dibutuhkan
import { useState, useEffect } from 'react';
// PERBAIKAN: Impor API client Anda (sesuaikan path jika perlu)
import api from '@/lib/api'; 
import { Users, MapPin, Package } from 'lucide-react';

// PERBAIKAN: Definisikan tipe data untuk statistik
interface AdminStats {
  totalUsers: number;
  totalMitra: number;
  totalPickupsThisMonth: number;
}

export default function AdminDashboard() {
  // PERBAIKAN: Tambahkan state untuk data dan loading
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // PERBAIKAN: Ambil data saat komponen dimuat
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Panggil endpoint baru yang kita buat di backend
        const { data } = await api.get('/admin/stats');
        
        // Simpan data ke state
        setStats(data.data); 
      } catch (error) {
        console.error('Gagal mengambil statistik admin:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []); // [] = Jalankan sekali saat komponen mount

  // PERBAIKAN: Tampilkan loading spinner
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  // Tampilkan pesan jika data gagal dimuat
  if (!stats) {
    return (
      <div>
        <h1 className="text-3xl text-gray-900 font-bold mb-6">Admin Dashboard</h1>
        <p className="text-red-600">Gagal memuat data statistik.</p>
      </div>
    );
  }

  // Jika data berhasil dimuat, tampilkan dashboard
  return (
    <div>
      <h1 className="text-3xl text-gray-900 font-bold mb-6">Admin Dashboard</h1>

      {/* Grid untuk Statistik Admin */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Total Pengguna */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-700">Total Pengguna</h3>
            <Users className="w-6 h-6 text-blue-500" />
          </div>
          {/* PERBAIKAN: Data dinamis */}
          <p className="text-4xl font-bold text-gray-900 mt-2">{stats.totalUsers}</p>
          <p className="text-sm text-gray-500 mt-1">Pengguna terdaftar</p>
        </div>

        {/* Total Mitra */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-700">Total Mitra</h3>
            <MapPin className="w-6 h-6 text-green-500" />
          </div>
          {/* PERBAIKAN: Data dinamis */}
          <p className="text-4xl font-bold text-gray-900 mt-2">{stats.totalMitra}</p>
          <p className="text-sm text-gray-500 mt-1">Mitra (Bank Sampah/Pengepul)</p>
        </div>

        {/* Total Penjemputan */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-700">Total Penjemputan</h3>
            <Package className="w-6 h-6 text-orange-500" />
          </div>
          {/* PERBAIKAN: Data dinamis */}
          <p className="text-4xl font-bold text-gray-900 mt-2">{stats.totalPickupsThisMonth}</p>
          <p className="text-sm text-gray-500 mt-1">Selesai bulan ini</p>
        </div>
      </div>

      {/* Tambahkan komponen lain di sini, misal: daftar user terbaru, dll */}
      <h2 className="text-2xl text-gray-900 font-bold mb-4">Aktivitas Terbaru</h2>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="text-gray-600">Widget untuk aktivitas terbaru (moderasi, dll) akan muncul di sini.</p>
      </div>
    </div>
  );
}