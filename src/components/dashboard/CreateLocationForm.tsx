// src/components/dashboard/CreateLocationForm.tsx
'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import LocationPickerMap from '@/components/map/LocationPickerMap';
import OperatingHoursEditor, { OperatingHours } from '@/components/dashboard/OperatingHoursEditor';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { MapPin, Phone, Clock, Package, Map } from 'lucide-react';

interface CreateLocationFormProps {
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

export default function CreateLocationForm({ isOpen, onClose, onSuccess }: CreateLocationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMap, setShowMap] = useState(true);
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
      coordinates: ['', '']
    },
    contact: {
      phone: '',
      email: '',
      whatsapp: ''
    },
    services: [] as string[],
    operatingHours: defaultOperatingHours
  });

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
    const { name, value } = e.target;
    
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

  const handleLocationSelect = (data: any) => {
    console.log('Location selected:', data);
    setFormData(prev => ({
      ...prev,
      location: {
        coordinates: [
          data.coordinates[0].toString(),
          data.coordinates[1].toString()
        ]
      },
      address: {
        street: data.address.street || prev.address.street,
        city: data.address.city || prev.address.city,
        province: data.address.province || prev.address.province,
        postalCode: data.address.postalCode || prev.address.postalCode
      }
    }));
  };

  const handleSubmit = async () => {
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
      toast.error('Koordinat lokasi harus diisi. Silakan pilih lokasi di peta.');
      return;
    }
    if (formData.services.length === 0) {
      toast.error('Minimal pilih satu layanan');
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading('Menyimpan lokasi...');

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

      console.log('Sending payload:', payload);
      
      const response = await api.post('/locations', payload);
      console.log('Response:', response.data);
      
      toast.success('Lokasi berhasil ditambahkan dan menunggu persetujuan admin!', { id: toastId });
      onSuccess();
      onClose();
      
      // Reset form
      setFormData({
        name: '',
        type: 'bank_sampah',
        description: '',
        address: { street: '', city: '', province: '', postalCode: '' },
        location: { coordinates: ['', ''] },
        contact: { phone: '', email: '', whatsapp: '' },
        services: [],
        operatingHours: defaultOperatingHours
      });
      setShowMap(true);
    } catch (error: any) {
      console.error('Error creating location:', error);
      toast.error(error.response?.data?.error || 'Gagal menambahkan lokasi', { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tambah Lokasi Baru" size="large">
      <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-2">
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
              placeholder="Contoh: Bank Sampah Sejahtera"
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
                <label key={service.value} className="flex items-center cursor-pointer">
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

        <div className="space-y-4 pt-4 border-t">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <MapPin className="w-5 h-5" /> Pilih Lokasi dari Peta <span className="text-red-500">*</span>
            </h3>
            <button
              type="button"
              onClick={() => setShowMap(!showMap)}
              className="text-sm text-green-600 hover:text-green-700 flex items-center gap-1 transition"
            >
              <Map className="w-4 h-4" />
              {showMap ? 'Sembunyikan Peta' : 'Tampilkan Peta'}
            </button>
          </div>

          {showMap && (
            <LocationPickerMap
              onLocationSelect={handleLocationSelect}
              initialCoordinates={
                formData.location.coordinates[0] && formData.location.coordinates[1]
                  ? [parseFloat(formData.location.coordinates[0]), parseFloat(formData.location.coordinates[1])]
                  : undefined
              }
            />
          )}
        </div>

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
              placeholder="Otomatis terisi dari peta atau isi manual"
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
                placeholder="Bekasi"
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
                placeholder="Jawa Barat"
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
              placeholder="17123"
            />
          </div>

          {formData.location.coordinates[0] && formData.location.coordinates[1] && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-xs font-medium text-green-800 mb-1">✅ Koordinat yang dipilih:</p>
              <p className="text-sm text-green-900 font-mono">
                Lat: {parseFloat(formData.location.coordinates[1]).toFixed(6)}, 
                Lng: {parseFloat(formData.location.coordinates[0]).toFixed(6)}
              </p>
            </div>
          )}
        </div>

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
              placeholder="08123456789"
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
              placeholder="email@contoh.com"
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
              placeholder="08123456789"
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

        <div className="flex justify-end gap-3 pt-6 border-t sticky bottom-0 bg-white py-4 -mb-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
            disabled={isSubmitting}
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition flex items-center gap-2"
            disabled={isSubmitting}
          >
            {isSubmitting && (
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {isSubmitting ? 'Menyimpan...' : 'Simpan Lokasi'}
          </button>
        </div>
      </div>
    </Modal>
  );
}