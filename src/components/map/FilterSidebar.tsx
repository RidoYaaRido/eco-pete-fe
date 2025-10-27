// src/components/map/FilterSidebar.tsx
'use client';

// PERBAIKAN: Mengaktifkan kembali import useState
import { useState } from 'react';
import { useLocationStore } from '../../store/locationStore';
import { X, Search, Filter, MapPin } from 'lucide-react';

const WASTE_CATEGORIES = [
  { value: '', label: 'Semua Kategori' },
  { value: 'plastik', label: 'Plastik' },
  { value: 'kertas', label: 'Kertas' },
  { value: 'logam', label: 'Logam' },
  { value: 'kaca', label: 'Kaca' },
  { value: 'elektronik', label: 'Elektronik' },
  { value: 'organik', label: 'Organik' },
];

const LOCATION_TYPES = [
  { value: '', label: 'Semua Tipe' },
  { value: 'bank_sampah', label: 'Bank Sampah' },
  { value: 'pengepul', label: 'Pengepul' },
  { value: 'daur_ulang', label: 'Daur Ulang' },
];

// Menambahkan interface Props
interface FilterSidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

// Menerima props isOpen dan setIsOpen
export default function FilterSidebar({ isOpen, setIsOpen }: FilterSidebarProps) {
  const { filters, setFilters, searchLocations, locations } = useLocationStore();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Menghapus state lokal 'isOpen'

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      searchLocations(searchQuery);
    }
  };

  return (
    <>
      {/* Mobile Toggle Button (menggunakan prop setIsOpen) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-24 left-4 z-[1000] bg-white p-3 rounded-lg shadow-lg"
      >
        <Filter className="w-5 h-5" />
      </button>

      {/* Sidebar (menggunakan prop isOpen) */}
      <div
        className={`fixed top-20 left-0 h-[calc(100vh-5rem)] bg-white shadow-lg z-[999] transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } w-80 overflow-y-auto`}
      >
        <div className="p-4">
          {/* Header (menggunakan prop setIsOpen) */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <MapPin className="w-6 h-6 text-green-600" />
              Filter Lokasi daerah
            </h2>
            <button
              onClick={() => setIsOpen(false)}
              className="lg:hidden p-1 hover:bg-gray-100 rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="mb-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Cari nama lokasi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                // --- PERBAIKAN WARNA TEKS INPUT ---
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 placeholder:text-gray-400"
              />
              <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
            </div>
          </form>

          {/* Filters (sisa kode tidak berubah) */}
          <div className="space-y-4">
            {/* Tipe Lokasi */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipe Lokasi
              </label>
              <select
                value={filters.type}
                onChange={(e) => setFilters({ type: e.target.value })}
                // --- PERBAIKAN WARNA TEKS SELECT ---
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
              >
                {LOCATION_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Kategori Sampah */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jenis Sampah
              </label>
              <select
                value={filters.wasteCategory}
                onChange={(e) => setFilters({ wasteCategory: e.target.value })}
                // --- PERBAIKAN WARNA TEKS SELECT ---
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
              >
                {WASTE_CATEGORIES.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Radius */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Radius: {filters.radius} km
              </label>
              <input
                type="range"
                min="1"
                max="50"
                step="1"
                value={filters.radius}
                onChange={(e) => setFilters({ radius: parseInt(e.target.value) })}
                className="w-full accent-green-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1 km</span>
                <span>50 km</span>
              </div>
            </div>

            {/* Verified Only */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="verified"
                checked={filters.verified}
                onChange={(e) => setFilters({ verified: e.target.checked })}
                className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
              />
              <label htmlFor="verified" className="ml-2 text-sm text-gray-700">
                Hanya lokasi terverifikasi
              </label>
            </div>

            {/* Reset Filter */}
            <button
              onClick={() =>
                setFilters({
                  type: '',
                  radius: 10,
                  wasteCategory: '',
                  verified: false,
                })
              }
              className="w-full py-2 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Reset Filter
            </button>
          </div>

          {/* Results Count */}
          <div className="mt-6 p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-gray-700">
              Ditemukan <span className="font-bold text-green-700">{locations.length}</span> lokasi
            </p>
          </div>

          {/* Location List */}
          <div className="mt-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Hasil Pencarian</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {locations.map((location) => (
                <div
                  key={location._id}
                  className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition"
                >
                  <h4 className="font-medium text-sm text-gray-800">{location.name}</h4>
                  <p className="text-xs text-gray-600 mt-1">{location.address.city}</p>
                  {location.distance && (
                    <p className="text-xs text-green-600 mt-1 font-semibold">
                      {location.distance.toFixed(2)} km
                    </p>
                  )}
                </div>
              ))}
              
              {locations.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  Tidak ada lokasi ditemukan
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Overlay (menggunakan prop isOpen dan setIsOpen) */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-[998]"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}