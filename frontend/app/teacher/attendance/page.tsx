'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { Calendar, Users, CheckCircle, XCircle, Clock, Search } from 'lucide-react';

interface Group {
    id: string;
    name: string;
    subject: string;
    level: string;
    students: Array<{
        id: string;
        name: string;
        surname: string;
        photo?: string;
        attendance?: {
            status: 'PRESENT' | 'ABSENT' | 'LATE';
            date: string;
        };
    }>;
}

interface AttendanceData {
    groups: Group[];
    selectedDate: string;
}

export default function TeacherAttendance() {
    const [attendanceData, setAttendanceData] = useState<AttendanceData | null>(null);
    const [selectedGroup, setSelectedGroup] = useState<string>('');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [attendanceStatus, setAttendanceStatus] = useState<Record<string, 'PRESENT' | 'ABSENT' | 'LATE'>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchAttendanceData();
    }, [selectedDate]);

    const fetchAttendanceData = async () => {
        try {
            const token = useAuthStore.getState().accessToken;
            const response = await fetch(`/api/teacher/attendance?date=${selectedDate}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setAttendanceData(data);
                
                // Set default group if none selected
                if (data.groups.length > 0 && !selectedGroup) {
                    setSelectedGroup(data.groups[0].id);
                }
                
                // Initialize attendance status
                const currentGroup = data.groups.find((g: Group) => g.id === selectedGroup || g.id === data.groups[0]?.id);
                if (currentGroup) {
                    const status: Record<string, 'PRESENT' | 'ABSENT' | 'LATE'> = {};
                    currentGroup.students.forEach(student => {
                        status[student.id] = student.attendance?.status || 'ABSENT';
                    });
                    setAttendanceStatus(status);
                }
            }
        } catch (error) {
            console.error('Error fetching attendance data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleGroupChange = (groupId: string) => {
        setSelectedGroup(groupId);
        
        if (attendanceData) {
            const group = attendanceData.groups.find(g => g.id === groupId);
            if (group) {
                const status: Record<string, 'PRESENT' | 'ABSENT' | 'LATE'> = {};
                group.students.forEach(student => {
                    status[student.id] = student.attendance?.status || 'ABSENT';
                });
                setAttendanceStatus(status);
            }
        }
    };

    const toggleAttendance = (studentId: string) => {
        setAttendanceStatus(prev => {
            const current = prev[studentId] || 'ABSENT';
            let next: 'PRESENT' | 'ABSENT' | 'LATE';
            
            switch (current) {
                case 'ABSENT':
                    next = 'PRESENT';
                    break;
                case 'PRESENT':
                    next = 'LATE';
                    break;
                case 'LATE':
                    next = 'ABSENT';
                    break;
                default:
                    next = 'PRESENT';
            }
            
            return { ...prev, [studentId]: next };
        });
    };

    const saveAttendance = async () => {
        setSaving(true);
        try {
            const token = useAuthStore.getState().accessToken;
            const response = await fetch('/api/teacher/attendance', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    groupId: selectedGroup,
                    date: selectedDate,
                    attendance: attendanceStatus
                }),
            });

            if (response.ok) {
                alert('Présences enregistrées avec succès!');
                fetchAttendanceData();
            }
        } catch (error) {
            console.error('Error saving attendance:', error);
            alert('Erreur lors de l\'enregistrement des présences');
        } finally {
            setSaving(false);
        }
    };

    const getAttendanceStats = () => {
        const values = Object.values(attendanceStatus);
        return {
            present: values.filter(s => s === 'PRESENT').length,
            absent: values.filter(s => s === 'ABSENT').length,
            late: values.filter(s => s === 'LATE').length,
            total: values.length
        };
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-64">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    const currentGroup = attendanceData?.groups.find(g => g.id === selectedGroup);
    const stats = getAttendanceStats();

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <Users className="h-8 w-8 text-blue-600" />
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Gestion des Présences</h1>
                            <p className="text-gray-600">Gérez les présences de vos groupes</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="bg-white rounded-lg shadow p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                            Date
                        </label>
                        <input
                            type="date"
                            id="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    
                    <div>
                        <label htmlFor="group" className="block text-sm font-medium text-gray-700 mb-2">
                            Groupe
                        </label>
                        <select
                            id="group"
                            value={selectedGroup}
                            onChange={(e) => handleGroupChange(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {attendanceData?.groups.map(group => (
                                <option key={group.id} value={group.id}>
                                    {group.name} - {group.subject} ({group.students.length} étudiants)
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Étudiants</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                        </div>
                        <Users className="h-8 w-8 text-gray-500" />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Présents</p>
                            <p className="text-2xl font-bold text-green-600">{stats.present}</p>
                        </div>
                        <CheckCircle className="h-8 w-8 text-green-500" />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">En Retard</p>
                            <p className="text-2xl font-bold text-orange-600">{stats.late}</p>
                        </div>
                        <Clock className="h-8 w-8 text-orange-500" />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Absents</p>
                            <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
                        </div>
                        <XCircle className="h-8 w-8 text-red-500" />
                    </div>
                </div>
            </div>

            {/* Student List */}
            {currentGroup && (
                <div className="bg-white rounded-lg shadow">
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">{currentGroup.name}</h3>
                                <p className="text-gray-600">{currentGroup.subject} - {currentGroup.level}</p>
                            </div>
                            <button
                                onClick={saveAttendance}
                                disabled={saving}
                                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg font-medium"
                            >
                                {saving ? 'Enregistrement...' : 'Enregistrer Présences'}
                            </button>
                        </div>
                    </div>
                    
                    <div className="p-6">
                        {currentGroup.students.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {currentGroup.students.map(student => {
                                    const status = attendanceStatus[student.id] || 'ABSENT';
                                    return (
                                        <div
                                            key={student.id}
                                            onClick={() => toggleAttendance(student.id)}
                                            className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${{
                                                'PRESENT': 'border-green-300 bg-green-50',
                                                'LATE': 'border-orange-300 bg-orange-50', 
                                                'ABSENT': 'border-red-300 bg-red-50'
                                            }[status]}`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                                                        {student.photo ? (
                                                            <img 
                                                                src={student.photo} 
                                                                alt={`${student.name} ${student.surname}`}
                                                                className="w-10 h-10 rounded-full object-cover"
                                                            />
                                                        ) : (
                                                            <span className="text-sm font-medium text-gray-700">
                                                                {student.name[0]}{student.surname[0]}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">
                                                            {student.name} {student.surname}
                                                        </p>
                                                        <p className={`text-sm font-medium ${{
                                                            'PRESENT': 'text-green-600',
                                                            'LATE': 'text-orange-600',
                                                            'ABSENT': 'text-red-600'
                                                        }[status]}`}>
                                                            {status === 'PRESENT' ? 'Présent' :
                                                             status === 'LATE' ? 'En retard' : 'Absent'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex-shrink-0">
                                                    {status === 'PRESENT' ? (
                                                        <CheckCircle className="h-6 w-6 text-green-500" />
                                                    ) : status === 'LATE' ? (
                                                        <Clock className="h-6 w-6 text-orange-500" />
                                                    ) : (
                                                        <XCircle className="h-6 w-6 text-red-500" />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-center py-8">Aucun étudiant dans ce groupe</p>
                        )}
                    </div>
                    
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 text-sm text-gray-600">
                        <p>Cliquez sur un étudiant pour changer son statut: Présent → En retard → Absent</p>
                    </div>
                </div>
            )}
        </div>
    );
}