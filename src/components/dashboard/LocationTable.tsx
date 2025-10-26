// src/components/dashboard/LocationTable.tsx
'use client';

import { Edit, Eye, Edit2 } from 'lucide-react';
import { useEffect } from 'react';
import { Location } from '@/types/location';

interface LocationTableProps {
  locations: Location[];
  onViewDetails: (location: Location) => void;
  onEdit: (location: Location) => void;
  isAdmin?: boolean;
}

export default function LocationTable({ 
  locations, 
  onViewDetails, 
  onEdit,
  isAdmin = false 
}: LocationTableProps) {
  
  // ✅ DEBUG: Log data yang diterima
  useEffect(() => {
    console.log('=== LOCATION TABLE DEBUG ===');
    console.log('Locations received:', locations.length);
    console.log('Full data:', locations);
    console.log('Is Admin:', isAdmin);
    console.log('===========================');
  }, [locations, isAdmin]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Disetujui</span>;
      case 'pending':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Pending</span>;
      case 'rejected':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Ditolak</span>;
      default:
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  const getTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      'bank_sampah': 'Bank Sampah',
      'pengepul': 'Pengepul',
      'daur_ulang': 'Daur Ulang',
    };
    return typeMap[type] || type;
  };

  // ✅ PERBAIKAN: Tampilkan pesan jika data kosong dengan informasi debug
  if (!locations || locations.length === 0) {
    return (
      <div className="bg-white shadow-md rounded-lg overflow-hidden p-8">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Tidak ada data lokasi untuk ditampilkan</p>
          <details className="text-left text-xs text-gray-400 mt-4">
            <summary className="cursor-pointer hover:text-gray-600 font-medium">
              🔍 Debug Info (Klik untuk expand)
            </summary>
            <div className="mt-2 p-3 bg-gray-50 rounded border space-y-1">
              <p><strong>Locations array length:</strong> {locations ? locations.length : 'null/undefined'}</p>
              <p><strong>Is Admin:</strong> {isAdmin ? 'Yes' : 'No'}</p>
              <p className="text-blue-600 mt-2">
                Cek Console Browser (F12) untuk log detail dari backend
              </p>
            </div>
          </details>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nama Lokasi
              </th>
              {isAdmin && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pemilik (Mitra)
                </th>
              )}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipe
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Kota
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tanggal
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {locations.map((location) => (
              <tr key={location._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{location.name}</div>
                </td>
                {isAdmin && (
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">{location.owner?.name || '-'}</div>
                  </td>
                )}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {getTypeLabel(location.type)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {location.address.city}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(location.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(location.createdAt).toLocaleDateString('id-ID')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    {/* Button View Details - Untuk semua */}
                    <button
                      onClick={() => onViewDetails(location)}
                      className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                      title={isAdmin ? "Lihat Detail & Moderasi" : "Lihat Detail"}
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    
                    {/* ✅ Button Edit - Tersedia untuk Admin DAN Mitra */}
                    <button
                      onClick={() => onEdit(location)}
                      className="text-green-600 hover:text-green-900 flex items-center gap-1"
                      title={isAdmin ? "Edit Lokasi (Admin)" : "Edit Lokasi"}
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* ✅ TAMBAHAN: Debug info di footer table */}
      <div className="px-6 py-3 bg-gray-50 border-t text-xs text-gray-500">
        Menampilkan {locations.length} lokasi
      </div>
    </div>
  );
}
