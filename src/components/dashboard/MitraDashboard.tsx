// src/components/dashboard/MitraDashboard.tsx
'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import StatsCard from '@/components/dashboard/StatsCard';
import { 
  MapPin, 
  Package, 
  Star, 
  TrendingUp, 
  Calendar, 
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import api from '@/lib/api';
import Link from 'next/link';

interface MitraDashboardData {
  locations: {
    total: number;
    active: number;
    verified: number;
    pending: number;
  };
  pickups: {
    total: number;
    pending: number;
    today: number;
    completed: number;
  };
  performance: {
    totalWasteCollected: number;
    averageRating: number;
    totalTransactions: number;
  };
}

export default function MitraDashboard() {
  const { user } = useAuthStore();
  const [data, setData] = useState<MitraDashboardData | null>(null);
  const [todaySchedule, setTodaySchedule] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    fetchTodaySchedule();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const { data: response } = await api.get('/dashboard/overview');
      setData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTodaySchedule = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data } = await api.get('/pickups/schedule', {
        params: {
          startDate: today,
          endDate: today
        }
      });
      setTodaySchedule(data.data[0]?.pickups || []);
    } catch (error) {
      console.error('Error fetching schedule:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Dashboard Mitra - {user?.businessInfo?.businessName || user?.name} 👋
        </h1>
        <p className="text-blue-100">
          Kelola lokasi dan jadwal penjemputan Anda
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Lokasi Terdaftar"
          value={data?.locations.total || 0}
          icon={MapPin}
          color="green"
          subtitle={`${data?.locations.verified || 0} Terverifikasi`}
        />
        <StatsCard
          title="Penjemputan Pending"
          value={data?.pickups.pending || 0}
          icon={Clock}
          color="yellow"
          subtitle="Perlu konfirmasi"
        />
        <StatsCard
          title="Penjemputan Hari Ini"
          value={data?.pickups.today || 0}
          icon={Calendar}
          color="blue"
        />
        <StatsCard
          title="Rating Rata-rata"
          value={data?.performance.averageRating?.toFixed(1) || '0.0'}
          icon={Star}
          color="purple"
          subtitle="Dari pengguna"
        />
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Total Sampah Terkumpul</h3>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-green-600">
            {data?.performance.totalWasteCollected?.toFixed(1) || '0'} kg
          </p>
          <p className="text-sm text-gray-600 mt-1">Sejak bergabung</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Total Transaksi</h3>
            <CheckCircle className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-blue-600">
            {data?.performance.totalTransactions || 0}
          </p>
          <p className="text-sm text-gray-600 mt-1">Penjemputan selesai</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Lokasi Aktif</h3>
            <MapPin className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-purple-600">
            {data?.locations.active || 0}
          </p>
          <p className="text-sm text-gray-600 mt-1">Dari {data?.locations.total || 0} total</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Aksi Cepat</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/dashboard/locations"
            className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition"
          >
            <MapPin className="w-8 h-8 text-green-600" />
            <div>
              <h3 className="font-semibold text-gray-800">Kelola Lokasi</h3>
              <p className="text-sm text-gray-600">Edit info lokasi Anda</p>
            </div>
          </Link>

          <Link
            href="/dashboard/pickups"
            className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition"
          >
            <Package className="w-8 h-8 text-blue-600" />
            <div>
              <h3 className="font-semibold text-gray-800">Jadwal Penjemputan</h3>
              <p className="text-sm text-gray-600">Lihat & kelola jadwal</p>
            </div>
          </Link>

          <Link
            href="/dashboard/reviews"
            className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition"
          >
            <Star className="w-8 h-8 text-purple-600" />
            <div>
              <h3 className="font-semibold text-gray-800">Lihat Ulasan</h3>
              <p className="text-sm text-gray-600">Respon ulasan pengguna</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Today's Schedule */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">Jadwal Hari Ini</h2>
          <Link
            href="/dashboard/pickups"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Lihat Semua →
          </Link>
        </div>

        {todaySchedule && todaySchedule.length > 0 ? (
          <div className="space-y-3">
            {todaySchedule.map((pickup: any) => (
              <div
                key={pickup._id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      {pickup.user?.name || 'Pengguna'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {pickup.pickupAddress.street}, {pickup.pickupAddress.city}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Slot: {pickup.timeSlot === 'morning' ? 'Pagi' : pickup.timeSlot === 'afternoon' ? 'Siang' : 'Sore'}
                    </p>
                  </div>
                </div>
                <div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      pickup.status === 'confirmed'
                        ? 'bg-blue-100 text-blue-700'
                        : pickup.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {pickup.status === 'confirmed'
                      ? 'Terkonfirmasi'
                      : pickup.status === 'pending'
                      ? 'Pending'
                      : 'Selesai'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">Tidak ada jadwal hari ini</p>
            <p className="text-sm text-gray-500">Jadwal penjemputan akan muncul di sini</p>
          </div>
        )}
      </div>

      {/* Pending Requests Alert */}
      {data && data.pickups.pending > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-yellow-800 mb-1">
                Permintaan Penjemputan Menunggu Konfirmasi
              </h3>
              <p className="text-sm text-yellow-700 mb-3">
                Anda memiliki {data.pickups.pending} permintaan penjemputan yang perlu dikonfirmasi.
              </p>
              <Link
                href="/dashboard/pickups?filter=pending"
                className="inline-block px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-sm font-medium"
              >
                Lihat Permintaan
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Tips untuk Mitra */}
      <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-6 border border-green-200">
        <h2 className="text-xl font-bold text-gray-800 mb-3">💡 Tips untuk Mitra</h2>
        <ul className="space-y-2 text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-green-600 font-bold">•</span>
            <span>Respons cepat meningkatkan rating dan kepercayaan pengguna</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 font-bold">•</span>
            <span>Update jam operasional secara berkala agar pengguna tahu kapan bisa menghubungi</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 font-bold">•</span>
            <span>Balas ulasan pengguna untuk menunjukkan perhatian Anda</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 font-bold">•</span>
            <span>Verifikasi lokasi meningkatkan kepercayaan dan visibilitas di peta</span>
          </li>
        </ul>
      </div>
    </div>
  );
}