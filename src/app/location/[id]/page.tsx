// src/app/location/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import ReviewForm from '@/components/review/ReviewForm';
import ReviewList from '@/components/review/ReviewList';
import PickupRequestForm from '@/components/pickup/PickupRequestForm';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Star,
  Navigation,
  ArrowLeft,
  Package,
  CheckCircle,
  Calendar,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function LocationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [location, setLocation] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPickupForm, setShowPickupForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'reviews'>('info');

  useEffect(() => {
    if (params.id) {
      fetchLocationDetail(params.id as string);
    }
  }, [params.id]);

  const fetchLocationDetail = async (id: string) => {
    try {
      const { data } = await api.get(`/locations/${id}`);
      setLocation(data.data);
    } catch (error) {
      toast.error('Gagal memuat detail lokasi');
      router.push('/');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!location) {
    return null;
  }

  const coords = location.address.coordinates.coordinates;
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${coords[1]},${coords[0]}`;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-700 hover:text-green-600"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Kembali</span>
          </button>

          <Link href="/" className="text-2xl font-bold text-green-600">
            Eco-Peta
          </Link>

          {isAuthenticated ? (
            <Link
              href="/dashboard"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
            >
              Dashboard
            </Link>
          ) : (
            <Link
              href="/login"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
            >
              Masuk
            </Link>
          )}
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Image */}
            {location.images && location.images.length > 0 ? (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <img
                  src={location.images[0]}
                  alt={location.name}
                  className="w-full h-64 object-cover"
                />
              </div>
            ) : (
              <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-lg shadow h-64 flex items-center justify-center">
                <Package className="w-24 h-24 text-white opacity-50" />
              </div>
            )}

            {/* Title & Rating */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {location.name}
                  </h1>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium capitalize">
                      {location.type.replace('_', ' ')}
                    </span>
                    {location.verified && (
                      <span className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                        <CheckCircle className="w-4 h-4" />
                        Terverifikasi
                      </span>
                    )}
                  </div>
                </div>

                {location.averageRating && (
                  <div className="text-right">
                    <div className="flex items-center gap-1 mb-1">
                      <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                      <span className="text-2xl font-bold text-gray-900">
                        {location.averageRating.toFixed(1)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {location.totalReviews} ulasan
                    </p>
                  </div>
                )}
              </div>

              {location.description && (
                <p className="text-gray-700">{location.description}</p>
              )}
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow">
              <div className="border-b border-gray-200">
                <div className="flex">
                  <button
                    onClick={() => setActiveTab('info')}
                    className={`px-6 py-4 font-medium transition ${
                      activeTab === 'info'
                        ? 'text-green-600 border-b-2 border-green-600'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    Informasi
                  </button>
                  <button
                    onClick={() => setActiveTab('reviews')}
                    className={`px-6 py-4 font-medium transition ${
                      activeTab === 'reviews'
                        ? 'text-green-600 border-b-2 border-green-600'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    Ulasan ({location.totalReviews || 0})
                  </button>
                </div>
              </div>

              <div className="p-6">
                {activeTab === 'info' && (
                  <div className="space-y-6">
                    {/* Contact Info */}
                    <div>
                      <h3 className="font-bold text-gray-800 mb-4">Kontak</h3>
                      <div className="space-y-3">
                        {location.contact.phone && (
                          <div className="flex items-center gap-3">
                            <Phone className="w-5 h-5 text-gray-500" />
                            <span className="text-gray-700">
                              {location.contact.phone}
                            </span>
                          </div>
                        )}
                        {location.contact.email && (
                          <div className="flex items-center gap-3">
                            <Mail className="w-5 h-5 text-gray-500" />
                            <span className="text-gray-700">
                              {location.contact.email}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Operational Hours */}
                    {location.operationalHours && (
                      <div>
                        <h3 className="font-bold text-gray-800 mb-4">
                          Jam Operasional
                        </h3>
                        <div className="flex items-center gap-3">
                          <Clock className="w-5 h-5 text-gray-500" />
                          <span className="text-gray-700">
                            {location.operationalHours.open} -{' '}
                            {location.operationalHours.close}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">
                          {location.operationalHours.days.join(', ')}
                        </p>
                      </div>
                    )}

                    {/* Waste Categories */}
                    {location.wasteCategories &&
                      location.wasteCategories.length > 0 && (
                        <div>
                          <h3 className="font-bold text-gray-800 mb-4">
                            Jenis Sampah yang Diterima
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {location.wasteCategories.map((cat: any) => (
                              <span
                                key={cat._id}
                                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                              >
                                {cat.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                    {/* Price Range */}
                    {location.priceRange && (
                      <div>
                        <h3 className="font-bold text-gray-800 mb-4">
                          Kisaran Harga
                        </h3>
                        <p className="text-gray-700">
                          Rp {location.priceRange.min.toLocaleString()} - Rp{' '}
                          {location.priceRange.max.toLocaleString()} / kg
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <div className="space-y-6">
                    {isAuthenticated && user?.role === 'public' && (
                      <ReviewForm
                        locationId={location._id}
                        onSuccess={() => fetchLocationDetail(location._id)}
                      />
                    )}
                    <ReviewList locationId={location._id} />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Location Card */}
            <div className="bg-white rounded-lg shadow p-6 sticky top-24">
              <h3 className="font-bold text-gray-800 mb-4">Lokasi</h3>
              <div className="flex items-start gap-3 mb-4">
                <MapPin className="w-5 h-5 text-gray-500 mt-1 flex-shrink-0" />
                <p className="text-gray-700">
                  {location.address.street}
                  <br />
                  {location.address.city}, {location.address.province}
                </p>
              </div>

              {location.distance && (
                <p className="text-green-600 font-semibold mb-4">
                  {location.distance.toFixed(2)} km dari Anda
                </p>
              )}

              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium mb-3"
              >
                <Navigation className="w-5 h-5" />
                Navigasi ke Lokasi
              </a>

              {isAuthenticated && user?.role === 'public' && (
                <button
                  onClick={() => setShowPickupForm(true)}
                  className="flex items-center justify-center gap-2 w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                >
                  <Calendar className="w-5 h-5" />
                  Request Penjemputan
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Pickup Modal */}
      {showPickupForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[1000] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Request Penjemputan
              </h2>
              <button
                onClick={() => setShowPickupForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <PickupRequestForm
              locationId={location._id}
              onSuccess={() => {
                setShowPickupForm(false);
                toast.success('Permintaan berhasil dibuat!');
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}