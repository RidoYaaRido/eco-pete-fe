// src/components/auth/ProtectedRoute.tsx
'use client';

import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';

// Anda bisa tambahkan komponen loading spinner di sini
const FullPageLoader = () => (
  <div className="flex justify-center items-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
  </div>
);

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  // Asumsi store Anda memiliki 'isLoading' untuk melacak status pengecekan awal
  const { isAuthenticated, checkAuth, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    // Panggil checkAuth hanya sekali saat komponen dimuat
    checkAuth();
  }, [checkAuth]); // checkAuth mungkin tidak perlu di sini jika stabil

  useEffect(() => {
    // Jalankan logika redirect HANYA SETELAH loading selesai
    if (isLoading) {
      return; // Masih mengecek, jangan lakukan apa-apa
    }

    // Jika sudah tidak loading DAN tidak terotentikasi, baru redirect
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]); // Efek ini bergantung pada isLoading

  // Tampilkan loader selagi status auth diperiksa
  if (isLoading) {
    return <FullPageLoader />;
  }

  // Jika sudah tidak loading DAN terotentikasi, tampilkan children
  return isAuthenticated ? <>{children}</> : null;
};

export default ProtectedRoute;
