// src/app/page.tsx - Homepage with Map
'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import FilterSidebar from '@/components/map/FilterSidebar';
import { MapPin, Package, Award, Users } from 'lucide-react';

// Dynamic import untuk Leaflet (client-side only)
const MapContainer = dynamic(() => import('@/components/map/MapContainer'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading map...</p>
      </div>
    </div>
  ),
});

export default function HomePage() {
  const { checkAuth, isAuthenticated, user } = useAuthStore();
  
  // State untuk mengontrol sidebar (diangkat ke parent)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <div className="relative h-screen overflow-hidden">
      {/* PERBAIKAN HEADER:
        1. Menambahkan 'h-20' untuk mengunci tinggi header (5rem)
      */}
      <header className="absolute top-0 left-0 right-0 z-[1000] bg-white shadow-md h-20">
        {/* 2. Menghapus 'py-4' dan menambahkan 'h-full' agar kontennya pas
        */}
        <div className="container mx-auto px-4 h-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-green-600">Eco-Peta</h1>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-gray-700 hover:text-green-600 font-medium">
              Beranda
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-green-600 font-medium">
              Tentang
            </Link>
            <Link href="/how-it-works" className="text-gray-700 hover:text-green-600 font-medium">
              Cara Kerja
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            {isAuthenticated && user ? (
              <>
                <Link
                  href="/dashboard"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                >
                  Dashboard
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-green-600 hover:text-green-700 font-medium"
                >
                  Masuk
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                >
                  Daftar
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* PERBAIKAN SIDEBAR:
        Mengirim state isOpen dan setIsOpen sebagai props
      */}
      <FilterSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      {/* PERBAIKAN MAP CONTAINER:
        1. 'pt-20' cocok dengan tinggi header 'h-20' (5rem)
        2. 'lg:ml-80' secara dinamis memberi ruang untuk sidebar
      */}
      <div className={`pt-20 transition-all duration-300 ${
          isSidebarOpen ? 'lg:ml-80' : 'lg:ml-0'
        }`}
      >
        <MapContainer />
      </div>

      {/* Floating Info Cards (Tidak berubah) */}
      <div className="absolute bottom-8 right-8 z-[999] hidden lg:block">
        <div className="bg-white rounded-lg shadow-lg p-6 w-80 space-y-4">
          <h3 className="font-bold text-gray-800 text-lg">
            🌿 Eco-Peta Platform
          </h3>
          <p className="text-sm text-gray-600">
            Platform pengelolaan limbah daur ulang berbasis komunitas
          </p>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <MapPin className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">Temukan Lokasi</p>
                <p className="text-xs text-gray-600">Bank sampah terdekat</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">Request Pickup</p>
                <p className="text-xs text-gray-600">Jadwalkan penjemputan</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Award className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">Kumpulkan Poin</p>
                <p className="text-xs text-gray-600">Tukar dengan reward</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">Komunitas</p>
                <p className="text-xs text-gray-600">Bergabung dengan komunitas</p>
              </div>
            </div>
          </div>

          {!isAuthenticated && (
            <Link
              href="/register"
              className="block w-full py-2 bg-green-600 text-white text-center rounded-lg hover:bg-green-700 font-medium mt-4"
            >
              Mulai Sekarang
            </Link>
          )}
        </div>
      </div>

      {/* PERBAIKAN LEGEND:
        Menggeser 'left' secara dinamis berdasarkan state sidebar
      */}
      <div 
        className={`absolute bottom-8 z-[999] bg-white rounded-lg shadow-lg p-4 ml-4 hidden lg:block transition-all duration-300 ${
          isSidebarOpen ? 'left-80' : 'left-4'
        }`}
      >
        <h4 className="font-semibold text-gray-800 mb-3 text-sm">Legenda</h4>
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-green-600 rounded-full border-2 border-white shadow"></div>
            <span className="text-xs text-gray-700">Bank Sampah</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-blue-600 rounded-full border-2 border-white shadow"></div>
            <span className="text-xs text-gray-700">Pengepul</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-orange-600 rounded-full border-2 border-white shadow"></div>
            <span className="text-xs text-gray-700">Daur Ulang</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 bg-blue-500 rounded-full border-2 border-white shadow"></div>
            <span className="text-xs text-gray-700">Lokasi Anda</span>
          </div>
        </div>
      </div>
    </div>
  );
}

