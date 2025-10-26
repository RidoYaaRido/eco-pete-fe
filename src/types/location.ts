// src/types/location.ts

// Tipe untuk Jam Operasional, kita pindahkan juga ke sini
export interface OperatingHours {
  [key: string]: {
    open: string;
    close: string;
    isClosed: boolean;
  };
}

// Tipe utama untuk Lokasi, menjadi satu-satunya sumber kebenaran
export interface Location {
  _id: string;
  name: string;
  owner?: { name: string; email?: string; phone?: string }; // owner bersifat opsional
  type: 'bank_sampah' | 'pengepul' | 'daur_ulang';
  description?: string;
  address: {
    street: string;
    city: string;
    province: string;
    postalCode?: string;
    fullAddress?: string; // Tambahkan dari page.tsx
  };
  location: {
    type?: 'Point'; // type bersifat opsional di frontend
    coordinates: [number, number];
  };
  contact: {
    phone: string;
    email?: string;
    whatsapp?: string;
  };
  services?: string[];
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string; // Tambahkan dari page.tsx
  isVerified: boolean;
  isActive: boolean;
  operatingHours?: OperatingHours;
  createdAt: string; // Tambahkan dari page.tsx
}
