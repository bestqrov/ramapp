'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { Calendar, Clock, MapPin, Users } from 'lucide-react';

interface ScheduleData {
    schedule: Array<{
        day: string;
        classes: Array<{
            id: string;
            groupName: string;
            subject: string;
            level: string;
            startTime: string;
            endTime: string;
            room?: string;
            studentCount: number;
        }>;
    }>;
    weekDates: {
        start: string;
        end: string;
    };
}

export default function TeacherSchedule() {
    const [scheduleData, setScheduleData] = useState<ScheduleData | null>(null);
    const [currentWeek, setCurrentWeek] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchScheduleData();
    }, [currentWeek]);

    const fetchScheduleData = async () => {
        try {
            const token = useAuthStore.getState().accessToken;
            const response = await fetch(`/api/dashboard/teacher/schedule?week=${currentWeek}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setScheduleData(data);
            }
        } catch (error) {
            console.error('Error fetching schedule data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getDayName = (day: string): string => {
        const days: Record<string, string> = {
            'MONDAY': 'Lundi',
            'TUESDAY': 'Mardi', 
            'WEDNESDAY': 'Mercredi',
            'THURSDAY': 'Jeudi',
            'FRIDAY': 'Vendredi',
            'SATURDAY': 'Samedi',
            'SUNDAY': 'Dimanche'
        };
        return days[day] || day;
    };

    const getTimeColor = (startTime: string): string => {
        const hour = parseInt(startTime.split(':')[0]);
        if (hour < 12) return 'bg-blue-100 text-blue-800';
        if (hour < 16) return 'bg-green-100 text-green-800';
        return 'bg-purple-100 text-purple-800';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-64">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    const totalClasses = scheduleData?.schedule.reduce((total, day) => total + day.classes.length, 0) || 0;
    const totalStudents = scheduleData?.schedule.reduce((total, day) => 
        total + day.classes.reduce((dayTotal, class_) => dayTotal + class_.studentCount, 0), 0
    ) || 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <Calendar className="h-8 w-8 text-blue-600" />
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Planning des Cours</h1>
                            <p className="text-gray-600">Votre emploi du temps hebdomadaire</p>
                        </div>
                    </div>
                    
                    {scheduleData?.weekDates && (
                        <div className="text-right">
                            <p className="text-sm text-gray-600">Semaine du</p>
                            <p className="font-medium text-gray-900">
                                {new Date(scheduleData.weekDates.start).toLocaleDateString('fr-FR')} au {' '}
                                {new Date(scheduleData.weekDates.end).toLocaleDateString('fr-FR')}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Week Navigation */}
            <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => setCurrentWeek(w => w - 1)}
                        className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium"
                    >
                        ← Semaine précédente
                    </button>
                    
                    <div className="flex items-center space-x-6">
                        <div className="text-center">
                            <p className="text-sm text-gray-600">Cours cette semaine</p>
                            <p className="text-2xl font-bold text-blue-600">{totalClasses}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-gray-600">Étudiants total</p>
                            <p className="text-2xl font-bold text-green-600">{totalStudents}</p>
                        </div>
                    </div>
                    
                    <button
                        onClick={() => setCurrentWeek(w => w + 1)}
                        className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium"
                    >
                        Semaine suivante →
                    </button>
                </div>
            </div>

            {/* Schedule Grid */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                {scheduleData?.schedule?.length ? (
                    <div className="divide-y divide-gray-200">
                        {scheduleData.schedule.map((daySchedule) => (
                            <div key={daySchedule.day} className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        {getDayName(daySchedule.day)}
                                    </h3>
                                    <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                                        {daySchedule.classes.length} cours
                                    </span>
                                </div>
                                
                                {daySchedule.classes.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {daySchedule.classes.map((class_) => (
                                            <div
                                                key={class_.id}
                                                className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all"
                                            >
                                                <div className="flex items-start justify-between mb-3">
                                                    <div>
                                                        <h4 className="font-medium text-gray-900">{class_.groupName}</h4>
                                                        <p className="text-sm text-gray-600">{class_.subject} - {class_.level}</p>
                                                    </div>
                                                    <span className={`px-2 py-1 rounded text-xs font-medium ${getTimeColor(class_.startTime)}`}>
                                                        {class_.startTime} - {class_.endTime}
                                                    </span>
                                                </div>
                                                
                                                <div className="space-y-2">
                                                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                                                        <Clock className="h-4 w-4" />
                                                        <span>{class_.startTime} - {class_.endTime}</span>
                                                    </div>
                                                    
                                                    {class_.room && (
                                                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                                                            <MapPin className="h-4 w-4" />
                                                            <span>Salle {class_.room}</span>
                                                        </div>
                                                    )}
                                                    
                                                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                                                        <Users className="h-4 w-4" />
                                                        <span>{class_.studentCount} étudiants</span>
                                                    </div>
                                                </div>
                                                
                                                <div className="mt-3 pt-3 border-t border-gray-100">
                                                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                                                        Voir les détails →
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500">Aucun cours ce jour</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg">Aucun cours programmé cette semaine</p>
                    </div>
                )}
            </div>

            {/* Legend */}
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Légende des heures</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-blue-100 rounded"></div>
                        <span className="text-sm text-gray-600">Matin (avant 12h)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-green-100 rounded"></div>
                        <span className="text-sm text-gray-600">Après-midi (12h-16h)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-purple-100 rounded"></div>
                        <span className="text-sm text-gray-600">Soir (après 16h)</span>
                    </div>
                </div>
            </div>
        </div>
    );
}