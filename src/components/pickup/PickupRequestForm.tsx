// src/components/pickup/PickupRequestForm.tsx
'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Calendar, Clock, MapPin, Package, Plus, Trash2 } from 'lucide-react';

interface PickupFormProps {
  locationId?: string;
  onSuccess?: () => void;
}

interface WasteItem {
  category: string;
  estimatedWeight: number;
  unit: 'kg' | 'gram' | 'ton';
}

export default function PickupRequestForm({ locationId, onSuccess }: PickupFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [locations, setLocations] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [wasteItems, setWasteItems] = useState<WasteItem[]>([
    { category: '', estimatedWeight: 0, unit: 'kg' },
  ]);

  const [formData, setFormData] = useState({
    location: locationId || '',
    scheduledDate: '',
    timeSlot: 'morning',
    pickupAddress: {
      street: '',
      city: '',
      coordinates: [] as number[],
      notes: '',
    },
  });

  useEffect(() => {
    fetchLocations();
    fetchCategories();
    getUserLocation();
  }, []);

  const fetchLocations = async () => {
    try {
      const { data } = await api.get('/locations');
      setLocations(data.data);
    } catch (error) {
      console.error('Error fetching locations:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/waste-categories');
      setCategories(data.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setFormData((prev) => ({
          ...prev,
          pickupAddress: {
            ...prev.pickupAddress,
            coordinates: [position.coords.longitude, position.coords.latitude],
          },
        }));
      });
    }
  };

  const addWasteItem = () => {
    setWasteItems([...wasteItems, { category: '', estimatedWeight: 0, unit: 'kg' }]);
  };

  const removeWasteItem = (index: number) => {
    setWasteItems(wasteItems.filter((_, i) => i !== index));
  };

  const updateWasteItem = (index: number, field: keyof WasteItem, value: any) => {
    const updated = [...wasteItems];
    updated[index] = { ...updated[index], [field]: value };
    setWasteItems(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.location) {
      toast.error('Pilih lokasi penjemputan');
      return;
    }

    if (wasteItems.some((item) => !item.category || item.estimatedWeight <= 0)) {
      toast.error('Lengkapi semua item sampah');
      return;
    }

    try {
      setIsLoading(true);

      const requestData = {
        location: formData.location,
        wasteItems,
        pickupAddress: formData.pickupAddress,
        scheduledDate: formData.scheduledDate,
        timeSlot: formData.timeSlot,
      };

      await api.post('/pickups', requestData);
      toast.success('Permintaan penjemputan berhasil dibuat!');

      // Reset form
      setFormData({
        location: locationId || '',
        scheduledDate: '',
        timeSlot: 'morning',
        pickupAddress: {
          street: '',
          city: '',
          coordinates: [],
          notes: '',
        },
      });
      setWasteItems([{ category: '', estimatedWeight: 0, unit: 'kg' }]);

      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Gagal membuat permintaan');
    } finally {
      setIsLoading(false);
    }
  };

  // Get minimum date (tomorrow)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Location Selection */}
      {!locationId && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MapPin className="w-4 h-4 inline mr-2" />
            Pilih Lokasi Penjemputan *
          </label>
          <select
            required
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">Pilih Lokasi</option>
            {locations.map((loc) => (
              <option key={loc._id} value={loc._id}>
                {loc.name} - {loc.address.city}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Waste Items */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          <Package className="w-4 h-4 inline mr-2" />
          Jenis & Estimasi Berat Sampah *
        </label>

        <div className="space-y-3">
          {wasteItems.map((item, index) => (
            <div key={index} className="flex gap-3 items-start">
              <select
                required
                value={item.category}
                onChange={(e) => updateWasteItem(index, 'category', e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="">Pilih Kategori</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>

              <input
                type="number"
                required
                min="0.1"
                step="0.1"
                placeholder="Berat"
                value={item.estimatedWeight || ''}
                onChange={(e) =>
                  updateWasteItem(index, 'estimatedWeight', parseFloat(e.target.value))
                }
                className="w-24 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />

              <select
                value={item.unit}
                onChange={(e) => updateWasteItem(index, 'unit', e.target.value)}
                className="w-24 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="kg">Kg</option>
                <option value="gram">Gram</option>
                <option value="ton">Ton</option>
              </select>

              {wasteItems.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeWasteItem(index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addWasteItem}
          className="mt-3 flex items-center gap-2 text-green-600 hover:text-green-700 font-medium"
        >
          <Plus className="w-4 h-4" />
          Tambah Item
        </button>
      </div>

      {/* Pickup Address */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Alamat Lengkap *
          </label>
          <input
            type="text"
            required
            placeholder="Jl. Contoh No. 123"
            value={formData.pickupAddress.street}
            onChange={(e) =>
              setFormData({
                ...formData,
                pickupAddress: { ...formData.pickupAddress, street: e.target.value },
              })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Kota *</label>
          <input
            type="text"
            required
            placeholder="Jakarta"
            value={formData.pickupAddress.city}
            onChange={(e) =>
              setFormData({
                ...formData,
                pickupAddress: { ...formData.pickupAddress, city: e.target.value },
              })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Catatan Tambahan
        </label>
        <textarea
          rows={3}
          placeholder="Contoh: Rumah pagar hijau, sebelah warung..."
          value={formData.pickupAddress.notes}
          onChange={(e) =>
            setFormData({
              ...formData,
              pickupAddress: { ...formData.pickupAddress, notes: e.target.value },
            })
          }
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
        />
      </div>

      {/* Schedule */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="w-4 h-4 inline mr-2" />
            Tanggal Penjemputan *
          </label>
          <input
            type="date"
            required
            min={minDate}
            value={formData.scheduledDate}
            onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Clock className="w-4 h-4 inline mr-2" />
            Waktu Penjemputan *
          </label>
          <select
            required
            value={formData.timeSlot}
            onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          >
            <option value="morning">Pagi (08:00 - 12:00)</option>
            <option value="afternoon">Siang (12:00 - 16:00)</option>
            <option value="evening">Sore (16:00 - 18:00)</option>
          </select>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
      >
        {isLoading ? 'Memproses...' : 'Buat Permintaan Penjemputan'}
      </button>
    </form>
  );
}