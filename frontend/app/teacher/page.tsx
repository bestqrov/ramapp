'use client';

import { useAuthStore } from '@/store/useAuthStore';
import { useState, useEffect } from 'react';
import { Users, Calendar, BookOpen, Clock, CheckCircle, XCircle, User } from 'lucide-react';
import Link from 'next/link';

interface TeacherData {
    teacher: {
        id: string;
        name: string;
        groups: Array<{
            id: string;
            name: string;
            subject: string;
            level: string;
            studentCount: number;
            timeSlots: Array<{
                day: string;
                startTime: string;
                endTime: string;
            }>;
            nextClass?: {
                date: string;
                time: string;
            };
        }>;
    };
    todayClasses: Array<{
        id: string;
        groupName: string;
        subject: string;
        startTime: string;
        endTime: string;
        studentCount: number;
    }>;
    attendanceStats: {
        totalStudents: number;
        presentToday: number;
        absentToday: number;
        attendanceRate: number;
    };
}

export default function TeacherDashboard() {
    const { user } = useAuthStore();
    const [teacherData, setTeacherData] = useState<TeacherData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTeacherData();
    }, []);

    const fetchTeacherData = async () => {
        try {
            const token = useAuthStore.getState().accessToken;
            const response = await fetch('/api/teacher/dashboard', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setTeacherData(data);
            }
        } catch (error) {
            console.error('Error fetching teacher data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-64">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    const stats = teacherData?.attendanceStats || { totalStudents: 0, presentToday: 0, absentToday: 0, attendanceRate: 0 };

    return (
        <div className="space-y-6">
            {/* Welcome Section */}
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center space-x-4">
                    <div className="bg-blue-100 p-3 rounded-full">
                        <User className="h-8 w-8 text-blue-600" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                            Bienvenue, {teacherData?.teacher.name}
                        </h2>
                        <p className="text-gray-600">
                            Vous gérez {teacherData?.teacher.groups?.length || 0} groupe(s) avec {stats.totalStudents} étudiants au total
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Groupes</p>
                            <p className="text-3xl font-bold text-blue-600">{teacherData?.teacher.groups?.length || 0}</p>
                        </div>
                        <BookOpen className="h-8 w-8 text-blue-500" />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Étudiants Total</p>
                            <p className="text-3xl font-bold text-purple-600">{stats.totalStudents}</p>
                        </div>
                        <Users className="h-8 w-8 text-purple-500" />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Présents Aujourd'hui</p>
                            <p className="text-3xl font-bold text-green-600">{stats.presentToday}</p>
                        </div>
                        <CheckCircle className="h-8 w-8 text-green-500" />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Taux de Présence</p>
                            <p className="text-3xl font-bold text-indigo-600">{stats.attendanceRate}%</p>
                        </div>
                        <Calendar className="h-8 w-8 text-indigo-500" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Today's Classes */}
                <div className="bg-white rounded-lg shadow">
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <Clock className="h-5 w-5 text-orange-500" />
                                <h3 className="text-lg font-semibold text-gray-900">Cours d'Aujourd'hui</h3>
                            </div>
                            <Link
                                href="/teacher/attendance"
                                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                            >
                                Gérer Présences →
                            </Link>
                        </div>
                    </div>
                    <div className="p-6">
                        {teacherData?.todayClasses?.length ? (
                            <div className="space-y-4">
                                {teacherData.todayClasses.map((class_) => (
                                    <div key={class_.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h4 className="font-medium text-gray-900">{class_.groupName}</h4>
                                                <p className="text-sm text-gray-600">{class_.subject}</p>
                                            </div>
                                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                                {class_.studentCount} étudiants
                                            </span>
                                        </div>
                                        
                                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                                            <Clock className="h-4 w-4" />
                                            <span>{class_.startTime} - {class_.endTime}</span>
                                        </div>
                                        
                                        <div className="mt-3">
                                            <Link
                                                href={`/teacher/attendance?group=${class_.id}`}
                                                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                                            >
                                                Prendre les présences →
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-center py-8">Aucun cours aujourd'hui</p>
                        )}
                    </div>
                </div>

                {/* My Groups */}
                <div className="bg-white rounded-lg shadow">
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center space-x-2">
                            <BookOpen className="h-5 w-5 text-blue-500" />
                            <h3 className="text-lg font-semibold text-gray-900">Mes Groupes</h3>
                        </div>
                    </div>
                    <div className="p-6">
                        {teacherData?.teacher.groups?.length ? (
                            <div className="space-y-4">
                                {teacherData.teacher.groups.map((group) => (
                                    <div key={group.id} className="border border-gray-200 rounded-lg p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h4 className="font-medium text-gray-900">{group.name}</h4>
                                                <p className="text-sm text-gray-600">{group.subject} - {group.level}</p>
                                            </div>
                                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                                {group.studentCount} étudiants
                                            </span>
                                        </div>
                                        
                                        <div className="space-y-1">
                                            {group.timeSlots?.map((slot, index) => (
                                                <div key={index} className="flex items-center space-x-2 text-sm text-gray-500">
                                                    <Clock className="h-3 w-3" />
                                                    <span>{slot.day}: {slot.startTime} - {slot.endTime}</span>
                                                </div>
                                            ))}
                                        </div>
                                        
                                        {group.nextClass && (
                                            <div className="mt-2 text-xs text-blue-600">
                                                Prochain cours: {new Date(group.nextClass.date).toLocaleDateString('fr-FR')} à {group.nextClass.time}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-center py-8">Aucun groupe assigné</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions Rapides</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link
                        href="/teacher/attendance"
                        className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                    >
                        <Users className="h-8 w-8 text-blue-500" />
                        <div>
                            <p className="font-medium text-gray-900">Gérer les Présences</p>
                            <p className="text-sm text-gray-600">Prendre les présences pour vos groupes</p>
                        </div>
                    </Link>
                    
                    <Link
                        href="/teacher/schedule"
                        className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors"
                    >
                        <Calendar className="h-8 w-8 text-green-500" />
                        <div>
                            <p className="font-medium text-gray-900">Voir le Planning</p>
                            <p className="text-sm text-gray-600">Consulter votre emploi du temps</p>
                        </div>
                    </Link>
                    
                    <div className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg opacity-50">
                        <BookOpen className="h-8 w-8 text-gray-400" />
                        <div>
                            <p className="font-medium text-gray-500">Rapports</p>
                            <p className="text-sm text-gray-400">Bientôt disponible</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}