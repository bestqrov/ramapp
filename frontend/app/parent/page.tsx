'use client';

import { useAuthStore } from '@/store/useAuthStore';
import { useState, useEffect } from 'react';
import { Calendar, BookOpen, CreditCard, User, Clock, CheckCircle, XCircle, AlertTriangle, DollarSign } from 'lucide-react';

interface ParentData {
    student: {
        id: string;
        name: string;
        surname: string;
        schoolLevel: string;
        photo?: string;
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
    payments: {
        pending: Array<{
            id: string;
            description: string;
            amount: number;
            dueDate: string;
            type: string;
        }>;
        recent: Array<{
            id: string;
            description: string;
            amount: number;
            paymentDate: string;
            method: string;
        }>;
    };
    alerts: Array<{
        id: string;
        title: string;
        message: string;
        type: 'info' | 'warning' | 'success' | 'payment';
        date: string;
    }>;
}

export default function ParentDashboard() {
    const { user } = useAuthStore();
    const [parentData, setParentData] = useState<ParentData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchParentData();
    }, []);

    const fetchParentData = async () => {
        try {
            const token = useAuthStore.getState().accessToken;
            const response = await fetch('/api/parent/dashboard', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setParentData(data);
            }
        } catch (error) {
            console.error('Error fetching parent data:', error);
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
        if (!parentData?.attendances.length) return { present: 0, absent: 0, late: 0, total: 0 };
        
        const stats = { present: 0, absent: 0, late: 0, total: parentData.attendances.length };
        parentData.attendances.forEach(attendance => {
            stats[attendance.status.toLowerCase() as keyof typeof stats]++;
        });
        return stats;
    };

    const stats = getAttendanceStats();
    const attendanceRate = stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0;
    const totalPending = parentData?.payments.pending.reduce((sum, payment) => sum + payment.amount, 0) || 0;

    return (
        <div className="space-y-6">
            {/* Student Info Section */}
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center space-x-4">
                    <div className="bg-blue-100 p-3 rounded-full">
                        <User className="h-8 w-8 text-blue-600" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                            Suivi de {parentData?.student.name} {parentData?.student.surname}
                        </h2>
                        <p className="text-gray-600">
                            Niveau: {parentData?.student.schoolLevel || 'Non spécifié'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
                            <p className="text-3xl font-bold text-blue-600">{parentData?.student.groups?.length || 0}</p>
                        </div>
                        <BookOpen className="h-8 w-8 text-blue-500" />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Paiements en attente</p>
                            <p className="text-3xl font-bold text-red-600">{totalPending.toFixed(2)} MAD</p>
                        </div>
                        <CreditCard className="h-8 w-8 text-red-500" />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Alertes</p>
                            <p className="text-3xl font-bold text-orange-600">{parentData?.alerts?.length || 0}</p>
                        </div>
                        <AlertTriangle className="h-8 w-8 text-orange-500" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Payment Status */}
                <div className="bg-white rounded-lg shadow">
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center space-x-2">
                            <CreditCard className="h-5 w-5 text-green-500" />
                            <h3 className="text-lg font-semibold text-gray-900">Statut des Paiements</h3>
                        </div>
                    </div>
                    <div className="p-6">
                        {/* Pending Payments */}
                        {parentData?.payments.pending?.length ? (
                            <div className="mb-6">
                                <h4 className="font-medium text-red-700 mb-3">Paiements en Attente</h4>
                                <div className="space-y-3">
                                    {parentData.payments.pending.map((payment) => (
                                        <div key={payment.id} className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-200">
                                            <div>
                                                <p className="font-medium text-gray-900">{payment.description}</p>
                                                <p className="text-sm text-gray-600">Échéance: {new Date(payment.dueDate).toLocaleDateString('fr-FR')}</p>
                                            </div>
                                            <span className="text-lg font-bold text-red-600">{payment.amount.toFixed(2)} MAD</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : null}

                        {/* Recent Payments */}
                        <div>
                            <h4 className="font-medium text-green-700 mb-3">Paiements Récents</h4>
                            {parentData?.payments.recent?.length ? (
                                <div className="space-y-3">
                                    {parentData.payments.recent.slice(0, 3).map((payment) => (
                                        <div key={payment.id} className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
                                            <div>
                                                <p className="font-medium text-gray-900">{payment.description}</p>
                                                <p className="text-sm text-gray-600">Payé le: {new Date(payment.paymentDate).toLocaleDateString('fr-FR')}</p>
                                            </div>
                                            <span className="text-lg font-bold text-green-600">{payment.amount.toFixed(2)} MAD</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-center py-4">Aucun paiement récent</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Attendance Overview */}
                <div className="bg-white rounded-lg shadow">
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center space-x-2">
                            <Calendar className="h-5 w-5 text-blue-500" />
                            <h3 className="text-lg font-semibold text-gray-900">Présences Récentes</h3>
                        </div>
                    </div>
                    <div className="p-6">
                        {parentData?.attendances?.length ? (
                            <div className="space-y-3">
                                {parentData.attendances.slice(0, 6).map((attendance) => (
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

            {/* Course Schedule */}
            <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center space-x-2">
                        <BookOpen className="h-5 w-5 text-purple-500" />
                        <h3 className="text-lg font-semibold text-gray-900">Planning des Cours</h3>
                    </div>
                </div>
                <div className="p-6">
                    {parentData?.student.groups?.length ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {parentData.student.groups.map((group) => (
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

            {/* Alerts */}
            {parentData?.alerts?.length ? (
                <div className="bg-white rounded-lg shadow">
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center space-x-2">
                            <AlertTriangle className="h-5 w-5 text-orange-500" />
                            <h3 className="text-lg font-semibold text-gray-900">Alertes et Notifications</h3>
                        </div>
                    </div>
                    <div className="p-6">
                        <div className="space-y-4">
                            {parentData.alerts.map((alert) => (
                                <div key={alert.id} className={`p-4 rounded-lg border-l-4 ${{
                                    'info': 'bg-blue-50 border-blue-400',
                                    'warning': 'bg-orange-50 border-orange-400',
                                    'success': 'bg-green-50 border-green-400',
                                    'payment': 'bg-red-50 border-red-400'
                                }[alert.type]}`}>
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-start space-x-2">
                                            {alert.type === 'payment' && <DollarSign className="h-5 w-5 text-red-500 mt-0.5" />}
                                            <div>
                                                <h4 className="font-medium text-gray-900">{alert.title}</h4>
                                                <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                                            </div>
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