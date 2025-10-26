// src/components/dashboard/PublicDashboard.tsx
'use client';

import { useAuthStore } from '@/store/authStore';
import { MapPin, Package, Award, ArrowUpRight, Calendar, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function PublicDashboard() {
  const { user } = useAuthStore();

  return (
    <div>
      {/* Header Selamat Datang */}
      <div className="bg-green-600 text-white p-6 rounded-lg shadow-lg mb-8">
        <h1 className="text-3xl font-bold">
          Selamat Datang, {user?.name}! 👋
        </h1>
        <p className="mt-1 opacity-90">Terus berkontribusi untuk lingkungan yang lebih bersih.</p>
      </div>

      {/* Grid Statistik Pengguna */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Penjemputan */}
        <div className="bg-white p-5 rounded-lg shadow-md flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Penjemputan</p>
            <p className="text-3xl font-bold text-gray-900">0</p>
            <p className="text-xs text-gray-400">Sejak bergabung</p>
          </div>
          <div className="w-12 h-12 flex items-center justify-center bg-green-100 rounded-full">
            <Package className="w-6 h-6 text-green-600" />
          </div>
        </div>

        {/* Penjemputan Selesai */}
        <div className="bg-white p-5 rounded-lg shadow-md flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Penjemputan Selesai</p>
            <p className="text-3xl font-bold text-gray-900">0</p>
            <p className="text-xs text-gray-400">+0 bulan ini</p>
          </div>
          <div className="w-12 h-12 flex items-center justify-center bg-blue-100 rounded-full">
            <ArrowUpRight className="w-6 h-6 text-blue-600" />
          </div>
        </div>

        {/* Menunggu Konfirmasi */}
        <div className="bg-white p-5 rounded-lg shadow-md flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Menunggu Konfirmasi</p>
            <p className="text-3xl font-bold text-gray-900">0</p>
            <p className="text-xs text-gray-400">Request baru</p>
          </div>
          <div className="w-12 h-12 flex items-center justify-center bg-yellow-100 rounded-full">
            <Calendar className="w-6 h-6 text-yellow-600" />
          </div>
        </div>

        {/* Total Poin */}
        <div className="bg-white p-5 rounded-lg shadow-md flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Poin</p>
            <p className="text-3xl font-bold text-gray-900">0</p>
            <p className="text-xs text-gray-400">Badge: Bronze</p>
          </div>
          <div className="w-12 h-12 flex items-center justify-center bg-purple-100 rounded-full">
            <Award className="w-6 h-6 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Aksi Cepat */}
      <h2 className="text-2xl text-gray-800 font-bold mb-4">Aksi Cepat</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link href="/" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow flex items-center gap-4">
          <MapPin className="w-8 h-8 text-green-600" />
          <div>
            <p className="font-semibold text-gray-800">Cari Lokasi</p>
            <p className="text-sm text-gray-500">Temukan bank sampah terdekat</p>
          </div>
        </Link>
        <Link href="/dashboard/pickups/new" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow flex items-center gap-4">
          <Package className="w-8 h-8 text-blue-600" />
          <div>
            <p className="font-semibold text-gray-800">Request Penjemputan</p>
            <p className="text-sm text-gray-500">Jadwalkan penjemputan sampah</p>
          </div>
        </Link>
        <Link href="/dashboard/points" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow flex items-center gap-4">
          <Award className="w-8 h-8 text-purple-600" />
          <div>
            <p className="font-semibold text-gray-800">Lihat Poin</p>
            <p className="text-sm text-gray-500">Riwayat poin & reward</p>
          </div>
        </Link>
      </div>

      {/* Penjemputan Terbaru */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl text-gray-800 font-bold">Penjemputan Terbaru</h2>
        <Link href="/dashboard/pickups" className="text-sm font-medium text-green-600 hover:text-green-500">
          Lihat Semua →
        </Link>
      </div>
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <AlertTriangle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">Belum ada riwayat penjemputan.</p>
      </div>
    </div>
  );
}