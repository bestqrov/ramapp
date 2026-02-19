import prisma from '../../config/database';

interface StudentDashboardData {
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
            timeSlots: any[];
        }>;
    };
    attendances: Array<{
        id: string;
        date: string;
        status: string;
        groupName: string;
        subject: string;
    }>;
    alerts: Array<{
        id: string;
        title: string;
        message: string;
        type: string;
        date: string;
    }>;
}

interface ParentDashboardData {
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
            timeSlots: any[];
        }>;
    };
    attendances: Array<{
        id: string;
        date: string;
        status: string;
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
        type: string;
        date: string;
    }>;
}

interface TeacherDashboardData {
    teacher: {
        id: string;
        name: string;
        groups: Array<{
            id: string;
            name: string;
            subject: string;
            level: string;
            studentCount: number;
            timeSlots: any[];
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

export const getStudentDashboardData = async (userId: string): Promise<StudentDashboardData> => {
    // Find the user and their linked student
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            student: {
                include: {
                    groups: true,
                    attendances: {
                        take: 10,
                        orderBy: { createdAt: 'desc' }
                    }
                }
            }
        }
    });

    if (!user || !user.student) {
        throw new Error('Student data not found');
    }

    const student = user.student;

    // Get groups with time slots
    const groups = await Promise.all(
        student.groups.map(async (group) => {
            const groupDetails = await prisma.group.findUnique({
                where: { id: group.id }
            });
            return {
                id: group.id,
                name: group.name,
                subject: group.subject || '',
                level: group.level || '',
                timeSlots: groupDetails?.timeSlots ? JSON.parse(JSON.stringify(groupDetails.timeSlots)) : []
            };
        })
    );

    // Format attendances
    const attendances = student.attendances.map(attendance => ({
        id: attendance.id,
        date: attendance.date.toISOString().split('T')[0],
        status: attendance.status,
        groupName: 'Cours', // You may want to add group name relation
        subject: ''
    }));

    // Mock alerts for now (you can implement a proper alerts system later)
    const alerts = [
        {
            id: '1',
            title: 'Bienvenue dans votre espace étudiant',
            message: 'Consultez régulièrement vos présences et le planning de vos cours.',
            type: 'info',
            date: new Date().toISOString()
        }
    ];

    return {
        student: {
            id: student.id,
            name: student.name,
            surname: student.surname,
            schoolLevel: student.schoolLevel || '',
            groups
        },
        attendances,
        alerts
    };
};

export const getParentDashboardData = async (userId: string): Promise<ParentDashboardData> => {
    // Find the user and their linked student (parent relationship)
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            parentStudent: {
                include: {
                    groups: true,
                    attendances: {
                        take: 10,
                        orderBy: { createdAt: 'desc' }
                    },
                    payments: {
                        take: 10,
                        orderBy: { createdAt: 'desc' }
                    }
                }
            }
        }
    });

    if (!user || !user.parentStudent) {
        throw new Error('Parent/Student data not found');
    }

    const student = user.parentStudent;

    // Get groups with time slots
    const groups = await Promise.all(
        student.groups.map(async (group) => {
            const groupDetails = await prisma.group.findUnique({
                where: { id: group.id }
            });
            return {
                id: group.id,
                name: group.name,
                subject: group.subject || '',
                level: group.level || '',
                timeSlots: groupDetails?.timeSlots ? JSON.parse(JSON.stringify(groupDetails.timeSlots)) : []
            };
        })
    );

    // Format attendances
    const attendances = student.attendances.map(attendance => ({
        id: attendance.id,
        date: attendance.date.toISOString().split('T')[0],
        status: attendance.status,
        groupName: 'Cours',
        subject: ''
    }));

    // Format payments
    const payments = {
        pending: [
            // Mock pending payments - you can implement real payment logic
            {
                id: '1',
                description: 'Frais de scolarité Mars',
                amount: 500,
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                type: 'monthly'
            }
        ],
        recent: student.payments.map(payment => ({
            id: payment.id,
            description: payment.description || 'Paiement',
            amount: payment.amount,
            paymentDate: payment.createdAt.toISOString(),
            method: payment.method
        }))
    };

    // Mock alerts with payment notifications
    const alerts = [
        {
            id: '1',
            title: 'Paiement en attente',
            message: 'Vous avez un paiement en attente pour ce mois.',
            type: 'payment',
            date: new Date().toISOString()
        }
    ];

    return {
        student: {
            id: student.id,
            name: student.name,
            surname: student.surname,
            schoolLevel: student.schoolLevel || '',
            photo: student.photo,
            groups
        },
        attendances,
        payments,
        alerts
    };
};

export const getTeacherDashboardData = async (userId: string): Promise<TeacherDashboardData> => {
    // Find the user and their assigned groups
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            teacherGroups: {
                include: {
                    students: true
                }
            }
        }
    });

    if (!user || user.role !== 'TEACHER') {
        throw new Error('Teacher data not found');
    }

    const groups = await Promise.all(
        user.teacherGroups.map(async (group) => {
            const groupDetails = await prisma.group.findUnique({
                where: { id: group.id },
                include: { students: true }
            });
            
            return {
                id: group.id,
                name: group.name,
                subject: group.subject || '',
                level: group.level || '',
                studentCount: groupDetails?.students.length || 0,
                timeSlots: groupDetails?.timeSlots ? JSON.parse(JSON.stringify(groupDetails.timeSlots)) : [],
                nextClass: {
                    date: new Date().toISOString().split('T')[0],
                    time: '14:00'
                }
            };
        })
    );

    // Get today's classes
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
    const todayClasses = groups.filter(group => {
        return group.timeSlots.some((slot: any) => slot.day === today);
    }).map(group => ({
        id: group.id,
        groupName: group.name,
        subject: group.subject,
        startTime: '14:00', // You'd get this from timeSlots
        endTime: '16:00',
        studentCount: group.studentCount
    }));

    // Calculate attendance stats (mock for now)
    const totalStudents = groups.reduce((total, group) => total + group.studentCount, 0);
    const attendanceStats = {
        totalStudents,
        presentToday: Math.floor(totalStudents * 0.85), // Mock 85% attendance
        absentToday: Math.floor(totalStudents * 0.15),
        attendanceRate: 85
    };

    return {
        teacher: {
            id: user.id,
            name: user.name,
            groups
        },
        todayClasses,
        attendanceStats
    };
};

// Teacher-specific services
export const getTeacherAttendanceData = async (userId: string, date: string) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            teacherGroups: {
                include: {
                    students: {
                        include: {
                            attendances: {
                                where: {
                                    date: new Date(date)
                                }
                            }
                        }
                    }
                }
            }
        }
    });

    if (!user || user.role !== 'TEACHER') {
        throw new Error('Teacher not found');
    }

    const groups = user.teacherGroups.map(group => ({
        id: group.id,
        name: group.name,
        subject: group.subject || '',
        level: group.level || '',
        students: group.students.map(student => ({
            id: student.id,
            name: student.name,
            surname: student.surname,
            photo: student.photo,
            attendance: student.attendances[0] ? {
                status: student.attendances[0].status,
                date: student.attendances[0].date.toISOString().split('T')[0]
            } : undefined
        }))
    }));

    return {
        groups,
        selectedDate: date
    };
};

export const saveAttendance = async (userId: string, groupId: string, date: string, attendance: Record<string, string>) => {
    // Verify teacher has access to this group
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            teacherGroups: {
                where: { id: groupId }
            }
        }
    });

    if (!user || !user.teacherGroups.length) {
        throw new Error('Access denied to this group');
    }

    // Save attendance for each student
    const attendancePromises = Object.entries(attendance).map(([studentId, status]) => {
        return prisma.attendance.upsert({
            where: {
                studentId_date: {
                    studentId: studentId,
                    date: new Date(date)
                }
            },
            update: {
                status: status as any
            },
            create: {
                studentId: studentId,
                date: new Date(date),
                status: status as any
            }
        });
    });

    await Promise.all(attendancePromises);
    return { success: true };
};

export const getTeacherScheduleData = async (userId: string, week: number) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            teacherGroups: {
                include: {
                    students: true
                }
            }
        }
    });

    if (!user || user.role !== 'TEACHER') {
        throw new Error('Teacher not found');
    }

    // Calculate week dates
    const today = new Date();
    const weekStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() + (week * 7) - today.getDay() + 1);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
    
    const schedule = days.map(day => ({
        day,
        classes: user.teacherGroups.filter(group => {
            const timeSlots = group.timeSlots ? JSON.parse(JSON.stringify(group.timeSlots)) : [];
            return timeSlots.some((slot: any) => slot.day === day);
        }).map(group => ({
            id: group.id,
            groupName: group.name,
            subject: group.subject || '',
            level: group.level || '',
            startTime: '14:00', // Get from timeSlots
            endTime: '16:00',   // Get from timeSlots
            room: group.room,
            studentCount: group.students.length
        }))
    }));

    return {
        schedule,
        weekDates: {
            start: weekStart.toISOString().split('T')[0],
            end: weekEnd.toISOString().split('T')[0]
        }
    };
};