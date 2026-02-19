'use client';

import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function StudentLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, accessToken } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        if (!accessToken || !user) {
            router.push('/login');
            return;
        }

        if (user.role !== 'STUDENT') {
            router.push('/');
            return;
        }
    }, [user, accessToken, router]);

    if (!accessToken || !user || user.role !== 'STUDENT') {
        return <div className="flex items-center justify-center min-h-screen">Chargement...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center">
                            <h1 className="text-2xl font-bold text-gray-900">Espace Étudiant</h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-gray-700">Bonjour, {user.name}</span>
                            <button
                                onClick={() => {
                                    useAuthStore.getState().logout();
                                    router.push('/login');
                                }}
                                className="text-red-600 hover:text-red-700"
                            >
                                Déconnexion
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>
        </div>
    );
}