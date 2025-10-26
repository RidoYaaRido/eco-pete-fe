// src/components/dashboard/AdminEditLocationForm.tsx
'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import OperatingHoursEditor from '@/components/dashboard/OperatingHoursEditor';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { MapPin, Phone, Package, Shield } from 'lucide-react';
import { Location, OperatingHours } from '@/types/location';

interface AdminEditLocationFormProps {
  location: Location | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const defaultOperatingHours: OperatingHours = {
  monday: { open: '08:00', close: '17:00', isClosed: false },
  tuesday: { open: '08:00', close: '17:00', isClosed: false },
  wednesday: { open: '08:00', close: '17:00', isClosed: false },
  thursday: { open: '08:00', close: '17:00', isClosed: false },
  friday: { open: '08:00', close: '17:00', isClosed: false },
  saturday: { open: '08:00', close: '17:00', isClosed: false },
  sunday: { open: '08:00', close: '17:00', isClosed: true }
};

export default function AdminEditLocationForm({ location, isOpen, onClose, onSuccess }: AdminEditLocationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'bank_sampah',
    description: '',
    address: {
      street: '',
      city: '',
      province: '',
      postalCode: ''
    },
    location: {
      coordinates: ['', ''] as [string, string]
    },
    contact: {
      phone: '',
      email: '',
      whatsapp: ''
    },
    services: [] as string[],
    status: 'pending' as 'pending' | 'approved' | 'rejected',
    isVerified: false,
    isActive: true,
    operatingHours: defaultOperatingHours
  });

  // Reset when modal closes
  useEffect(() => {
    if (!isOpen) {
      // Optional: reset form when closing
    }
  }, [isOpen]);

  // Load location data
  useEffect(() => {
    if (location && isOpen) {
      console.log('Admin loading location data:', location);
      
      setFormData({
        name: location.name || '',
        type: location.type || 'bank_sampah',
        description: location.description || '',
        address: {
          street: location.address?.street || '',
          city: location.address?.city || '',
          province: location.address?.province || '',
          postalCode: location.address?.postalCode || ''
        },
        location: {
          coordinates: [
            location.location?.coordinates[0]?.toString() || '',
            location.location?.coordinates[1]?.toString() || ''
          ] as [string, string]
        },
        contact: {
          phone: location.contact?.phone || '',
          email: location.contact?.email || '',
          whatsapp: location.contact?.whatsapp || ''
        },
        services: location.services || [],
        status: location.status || 'pending',
        isVerified: location.isVerified || false,
        isActive: location.isActive !== undefined ? location.isActive : true,
        operatingHours: location.operatingHours || defaultOperatingHours
      });
    }
  }, [location?._id, isOpen]); // Use location._id for better tracking

  const locationTypes = [
    { value: 'bank_sampah', label: 'Bank Sampah' },
    { value: 'pengepul', label: 'Pengepul' },
    { value: 'daur_ulang', label: 'Daur Ulang' }
  ];

  const serviceOptions = [
    { value: 'pickup', label: 'Penjemputan' },
    { value: 'dropoff', label: 'Antar Sendiri' },
    { value: 'both', label: 'Keduanya' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
      return;
    }
    
    if (name.startsWith('address.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: { ...prev.address, [field]: value }
      }));
    } else if (name.startsWith('contact.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        contact: { ...prev.contact, [field]: value }
      }));
    } else if (name === 'longitude' || name === 'latitude') {
      const index = name === 'longitude' ? 0 : 1;
      const newCoordinates: [string, string] = [...formData.location.coordinates] as [string, string];
      newCoordinates[index] = value;
      setFormData(prev => ({
        ...prev,
        location: { coordinates: newCoordinates }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleServiceChange = (service: string) => {
    setFormData(prev => {
      const services = prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service];
      return { ...prev, services };
    });
  };

  const handleOperatingHoursChange = (hours: OperatingHours) => {
    setFormData(prev => ({ ...prev, operatingHours: hours }));
  };

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      toast.loading('Mengambil lokasi Anda...');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { longitude, latitude } = position.coords;
          setFormData(prev => ({
            ...prev,
            location: {
              coordinates: [longitude.toString(), latitude.toString()] as [string, string]
            }
          }));
          toast.dismiss();
          toast.success('Lokasi berhasil diambil');
        },
        (error) => {
          toast.dismiss();
          toast.error('Gagal mengambil lokasi: ' + error.message);
        }
      );
    } else {
      toast.error('Browser tidak mendukung geolokasi');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!location) return;

    if (!formData.name.trim()) {
      toast.error('Nama lokasi harus diisi');
      return;
    }
    if (!formData.address.street.trim() || !formData.address.city.trim() || !formData.address.province.trim()) {
      toast.error('Alamat lengkap harus diisi');
      return;
    }
    if (!formData.contact.phone.trim()) {
      toast.error('Nomor telepon harus diisi');
      return;
    }
    if (!formData.location.coordinates[0] || !formData.location.coordinates[1]) {
      toast.error('Koordinat lokasi harus diisi');
      return;
    }
    if (formData.services.length === 0) {
      toast.error('Minimal pilih satu layanan');
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading('Menyimpan perubahan...');

    try {
      const payload = {
        ...formData,
        location: {
          type: 'Point',
          coordinates: [
            parseFloat(formData.location.coordinates[0]),
            parseFloat(formData.location.coordinates[1])
          ]
        }
      };

      await api.put(`/locations/${location._id}`, payload);
      toast.success('Lokasi berhasil diupdate!', { id: toastId });
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Gagal mengupdate lokasi', { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!location) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Lokasi (Admin)" size="large">
      <form onSubmit={handleSubmit} className="space-y-6 max-h-[75vh] overflow-y-auto pr-2">
        {/* Admin Controls */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <Shield className="w-5 h-5" /> Kontrol Admin
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                required
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div className="flex items-center">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="isVerified"
                  checked={formData.isVerified}
                  onChange={handleInputChange}
                  className="rounded border-gray-300 text-blue-600 mr-2"
                />
                <span className="text-sm text-gray-700">Terverifikasi</span>
              </label>
            </div>

            <div className="flex items-center">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="rounded border-gray-300 text-blue-600 mr-2"
                />
                <span className="text-sm text-gray-700">Aktif</span>
              </label>
            </div>
          </div>
        </div>

        {/* Informasi Dasar */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Package className="w-5 h-5" /> Informasi Dasar
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Lokasi <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipe Lokasi <span className="text-red-500">*</span>
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
              required
            >
              {locationTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Deskripsi
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
              placeholder="Deskripsi singkat tentang lokasi ini..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Layanan yang Tersedia <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              {serviceOptions.map(service => (
                <label key={service.value} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.services.includes(service.value)}
                    onChange={() => handleServiceChange(service.value)}
                    className="rounded border-gray-300 text-green-600 mr-2"
                  />
                  <span className="text-sm text-gray-700">{service.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Alamat */}
        <div className="space-y-4 pt-4 border-t">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <MapPin className="w-5 h-5" /> Alamat
          </h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Jalan/Alamat <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="address.street"
              value={formData.address.street}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kota <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="address.city"
                value={formData.address.city}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Provinsi <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="address.province"
                value={formData.address.province}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kode Pos
            </label>
            <input
              type="text"
              name="address.postalCode"
              value={formData.address.postalCode}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Koordinat Lokasi <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <input
                  type="number"
                  step="any"
                  name="longitude"
                  value={formData.location.coordinates[0]}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                  placeholder="Longitude"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Longitude</p>
              </div>
              <div>
                <input
                  type="number"
                  step="any"
                  name="latitude"
                  value={formData.location.coordinates[1]}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                  placeholder="Latitude"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Latitude</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleGetCurrentLocation}
              className="mt-2 text-sm text-green-600 hover:text-green-700 underline"
            >
              Gunakan Lokasi Saat Ini
            </button>
          </div>
        </div>

        {/* Kontak */}
        <div className="space-y-4 pt-4 border-t">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Phone className="w-5 h-5" /> Kontak
          </h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nomor Telepon <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="contact.phone"
              value={formData.contact.phone}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="contact.email"
              value={formData.contact.email}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              WhatsApp
            </label>
            <input
              type="tel"
              name="contact.whatsapp"
              value={formData.contact.whatsapp}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
            />
          </div>
        </div>

        {/* Operating Hours Editor */}
        <div className="pt-4 border-t">
          <OperatingHoursEditor
            operatingHours={formData.operatingHours}
            onChange={handleOperatingHoursChange}
          />
        </div>

        {/* Tombol Submit */}
        <div className="flex justify-end gap-3 pt-6 border-t sticky bottom-0 bg-white py-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
            disabled={isSubmitting}
          >
            Batal
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
