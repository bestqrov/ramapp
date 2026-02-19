'use client';

import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { Calendar, Users, BookOpen, Clock } from 'lucide-react';

export default function TeacherLayout({
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

        if (user.role !== 'TEACHER') {
            router.push('/');
            return;
        }
    }, [user, accessToken, router]);

    if (!accessToken || !user || user.role !== 'TEACHER') {
        return <div className="flex items-center justify-center min-h-screen">Chargement...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center">
                            <h1 className="text-2xl font-bold text-gray-900">Espace Enseignant</h1>
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

            {/* Navigation */}
            <nav className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex space-x-8">
                        <Link
                            href="/teacher"
                            className="flex items-center space-x-2 py-3 px-1 border-b-2 border-transparent hover:border-blue-500 text-gray-500 hover:text-blue-600"
                        >
                            <BookOpen className="h-4 w-4" />
                            <span>Tableau de Bord</span>
                        </Link>
                        <Link
                            href="/teacher/attendance"
                            className="flex items-center space-x-2 py-3 px-1 border-b-2 border-transparent hover:border-blue-500 text-gray-500 hover:text-blue-600"
                        >
                            <Users className="h-4 w-4" />
                            <span>Présences</span>
                        </Link>
                        <Link
                            href="/teacher/schedule"
                            className="flex items-center space-x-2 py-3 px-1 border-b-2 border-transparent hover:border-blue-500 text-gray-500 hover:text-blue-600"
                        >
                            <Calendar className="h-4 w-4" />
                            <span>Planning</span>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>
        </div>
    );
}