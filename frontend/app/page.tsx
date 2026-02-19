'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '../store/useAuthStore';

export default function HomePage() {
    const router = useRouter();
    const { user, accessToken, loading } = useAuthStore();

    useEffect(() => {
        // If not loading, check auth status
        if (!loading) {
            if (accessToken) {
                // User is authenticated, redirect based on role
                if (user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') {
                    router.push('/admin');
                } else if (user?.role === 'SECRETARY') {
                    router.push('/secretary');
                } else if (user?.role === 'STUDENT') {
                    router.push('/student');
                } else if (user?.role === 'PARENT') {
                    router.push('/parent');
                } else if (user?.role === 'TEACHER') {
                    router.push('/teacher');
                }
                // If other roles exist, they might stay here or go elsewhere
            } else {
                // Not authenticated, go to login
                router.push('/login');
            }
        }
    }, [user, accessToken, loading, router]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50">
            <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                <p className="text-slate-500 font-medium animate-pulse">Chargement...</p>
            </div>
        </div>
    );
}
