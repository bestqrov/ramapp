'use client';

import { useAuthStore } from '@/store/useAuthStore';
import { useState, useEffect } from 'react';
import { Calendar, BookOpen, Bell, User, Clock, CheckCircle, XCircle } from 'lucide-react';

interface StudentData {
    student: {
        id: string;
        name: string;
        surname: string;
        schoolLevel: string;
        groups: Array<{
            id: string;
            name: string;
            subject: string;
            level: string;
            timeSlots: Array<{
                day: string;
                startTime: string;
                endTime: string;
            }>;
        }>;
    };
    attendances: Array<{
        id: string;
        date: string;
        status: 'PRESENT' | 'ABSENT' | 'LATE';
        groupName: string;
        subject: string;
    }>;
    alerts: Array<{
        id: string;
        title: string;
        message: string;
        type: 'info' | 'warning' | 'success';
        date: string;
    }>;
}

export default function StudentDashboard() {
    const { user } = useAuthStore();
    const [studentData, setStudentData] = useState<StudentData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStudentData();
    }, []);

    const fetchStudentData = async () => {
        try {
            const token = useAuthStore.getState().accessToken;
            const response = await fetch('/api/student/dashboard', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setStudentData(data);
            }
        } catch (error) {
            console.error('Error fetching student data:', error);
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

    const getAttendanceStats = () => {
        if (!studentData?.attendances.length) return { present: 0, absent: 0, late: 0, total: 0 };
        
        const stats = { present: 0, absent: 0, late: 0, total: studentData.attendances.length };
        studentData.attendances.forEach(attendance => {
            stats[attendance.status.toLowerCase() as keyof typeof stats]++;
        });
        return stats;
    };

    const stats = getAttendanceStats();
    const attendanceRate = stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0;

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
                            Bienvenue, {studentData?.student.name} {studentData?.student.surname}
                        </h2>
                        <p className="text-gray-600">
                            Niveau: {studentData?.student.schoolLevel || 'Non spécifié'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Taux de Présence</p>
                            <p className="text-3xl font-bold text-green-600">{attendanceRate}%</p>
                        </div>
                        <CheckCircle className="h-8 w-8 text-green-500" />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Groupes Inscrits</p>
                            <p className="text-3xl font-bold text-blue-600">{studentData?.student.groups?.length || 0}</p>
                        </div>
                        <BookOpen className="h-8 w-8 text-blue-500" />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Alertes</p>
                            <p className="text-3xl font-bold text-orange-600">{studentData?.alerts?.length || 0}</p>
                        </div>
                        <Bell className="h-8 w-8 text-orange-500" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* My Courses */}
                <div className="bg-white rounded-lg shadow">
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center space-x-2">
                            <BookOpen className="h-5 w-5 text-blue-500" />
                            <h3 className="text-lg font-semibold text-gray-900">Mes Cours</h3>
                        </div>
                    </div>
                    <div className="p-6">
                        {studentData?.student.groups?.length ? (
                            <div className="space-y-4">
                                {studentData.student.groups.map((group) => (
                                    <div key={group.id} className="border border-gray-200 rounded-lg p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h4 className="font-medium text-gray-900">{group.name}</h4>
                                                <p className="text-sm text-gray-600">{group.subject} - {group.level}</p>
                                            </div>
                                        </div>
                                        
                                        {group.timeSlots?.map((slot, index) => (
                                            <div key={index} className="flex items-center space-x-2 mt-2 text-sm text-gray-500">
                                                <Clock className="h-4 w-4" />
                                                <span>{slot.day}: {slot.startTime} - {slot.endTime}</span>
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-center py-8">Aucun cours inscrit</p>
                        )}
                    </div>
                </div>

                {/* Recent Attendance */}
                <div className="bg-white rounded-lg shadow">
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center space-x-2">
                            <Calendar className="h-5 w-5 text-green-500" />
                            <h3 className="text-lg font-semibold text-gray-900">Présences Récentes</h3>
                        </div>
                    </div>
                    <div className="p-6">
                        {studentData?.attendances?.length ? (
                            <div className="space-y-3">
                                {studentData.attendances.slice(0, 5).map((attendance) => (
                                    <div key={attendance.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                                        <div>
                                            <p className="font-medium text-gray-900">{attendance.subject}</p>
                                            <p className="text-sm text-gray-600">{new Date(attendance.date).toLocaleDateString('fr-FR')}</p>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            {attendance.status === 'PRESENT' ? (
                                                <CheckCircle className="h-5 w-5 text-green-500" />
                                            ) : attendance.status === 'LATE' ? (
                                                <Clock className="h-5 w-5 text-orange-500" />
                                            ) : (
                                                <XCircle className="h-5 w-5 text-red-500" />
                                            )}
                                            <span className={`text-sm font-medium ${{
                                                'PRESENT': 'text-green-600',
                                                'LATE': 'text-orange-600',
                                                'ABSENT': 'text-red-600'
                                            }[attendance.status]}`}>
                                                {attendance.status === 'PRESENT' ? 'Présent' : 
                                                 attendance.status === 'LATE' ? 'En retard' : 'Absent'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-center py-8">Aucune donnée de présence</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Alerts */}
            {studentData?.alerts?.length ? (
                <div className="bg-white rounded-lg shadow">
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center space-x-2">
                            <Bell className="h-5 w-5 text-orange-500" />
                            <h3 className="text-lg font-semibold text-gray-900">Alertes de l'École</h3>
                        </div>
                    </div>
                    <div className="p-6">
                        <div className="space-y-4">
                            {studentData.alerts.map((alert) => (
                                <div key={alert.id} className={`p-4 rounded-lg border-l-4 ${{
                                    'info': 'bg-blue-50 border-blue-400',
                                    'warning': 'bg-orange-50 border-orange-400',
                                    'success': 'bg-green-50 border-green-400'
                                }[alert.type]}`}>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-medium text-gray-900">{alert.title}</h4>
                                            <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                                        </div>
                                        <span className="text-xs text-gray-500">
                                            {new Date(alert.date).toLocaleDateString('fr-FR')}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
}