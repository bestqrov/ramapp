import prisma from '../../config/database';
import { hashPassword } from '../../utils/bcrypt';
import { generateToken } from '../../utils/jwt';

// Generate student login credentials when student subscribes (only SOUTIEN students)
export const createStudentCredentials = async (studentId: string, adminId: string) => {
    // Check if admin has permission
    const admin = await prisma.user.findUnique({
        where: { id: adminId },
    });

    if (!admin || !['ADMIN', 'SUPER_ADMIN'].includes(admin.role)) {
        throw new Error('Insufficient permissions');
    }

    // Get student details
    const student = await prisma.student.findUnique({
        where: { id: studentId },
        include: { inscriptions: true }
    });

    if (!student) {
        throw new Error('Student not found');
    }

    // Check if student has SOUTIEN inscription
    const hasSoutienInscription = student.inscriptions.some(
        (inscription: any) => inscription.type === 'SOUTIEN'
    );

    if (!hasSoutienInscription) {
        throw new Error('Only SOUTIEN students can have login credentials');
    }

    // Check if student already has login credentials
    const existingUser = await prisma.user.findFirst({
        where: { studentId: studentId }
    });

    if (existingUser) {
        throw new Error('Student already has login credentials');
    }

    // Generate unique email and password
    const email = `student.${student.name.toLowerCase()}.${student.surname.toLowerCase()}@arwaeduc.local`;
    const password = `${student.name.slice(0,3).toLowerCase()}${student.surname.slice(0,3).toLowerCase()}${Math.floor(Math.random() * 1000)}`;
    const hashedPassword = await hashPassword(password);

    // Create student user account
    const studentUser = await prisma.user.create({
        data: {
            email: email,
            password: hashedPassword,
            name: `${student.name} ${student.surname}`,
            role: 'STUDENT',
            studentId: studentId
        }
    });

    return {
        studentUser: {
            id: studentUser.id,
            email: studentUser.email,
            name: studentUser.name,
            role: studentUser.role
        },
        credentials: {
            email: email,
            password: password // Return plain password for admin to give to student
        }
    };
};

// Generate parent login credentials when student subscribes (only SOUTIEN students)
export const createParentCredentials = async (studentId: string, adminId: string) => {
    // Check if admin has permission
    const admin = await prisma.user.findUnique({
        where: { id: adminId },
    });

    if (!admin || !['ADMIN', 'SUPER_ADMIN'].includes(admin.role)) {
        throw new Error('Insufficient permissions');
    }

    // Get student details
    const student = await prisma.student.findUnique({
        where: { id: studentId },
        include: { inscriptions: true }
    });

    if (!student) {
        throw new Error('Student not found');
    }

    // Check if student has SOUTIEN inscription
    const hasSoutienInscription = student.inscriptions.some(
        (inscription: any) => inscription.type === 'SOUTIEN'
    );

    if (!hasSoutienInscription) {
        throw new Error('Only SOUTIEN students can have parent login credentials');
    }

    // Check if parent already has login credentials for this student
    const existingParent = await prisma.user.findFirst({
        where: { parentStudentId: studentId }
    });

    if (existingParent) {
        throw new Error('Parent already has login credentials for this student');
    }

    // Generate unique email and password for parent
    const parentName = student.parentName || 'Parent';
    const email = `parent.${student.name.toLowerCase()}.${student.surname.toLowerCase()}@arwaeduc.local`;
    const password = `parent${student.name.slice(0,2).toLowerCase()}${student.surname.slice(0,2).toLowerCase()}${Math.floor(Math.random() * 1000)}`;
    const hashedPassword = await hashPassword(password);

    // Create parent user account
    const parentUser = await prisma.user.create({
        data: {
            email: email,
            password: hashedPassword,
            name: parentName,
            role: 'PARENT',
            parentStudentId: studentId,
            gsm: student.parentPhone
        }
    });

    return {
        parentUser: {
            id: parentUser.id,
            email: parentUser.email,
            name: parentUser.name,
            role: parentUser.role
        },
        credentials: {
            email: email,
            password: password // Return plain password for admin to give to parent
        }
    };
};

// Create teacher login credentials (admin can change like secretary login)
export const createTeacherCredentials = async (teacherData: {
    name: string;
    email?: string;
    phone?: string;
    groupIds: string[];
}, adminId: string) => {
    // Check if admin has permission
    const admin = await prisma.user.findUnique({
        where: { id: adminId },
    });

    if (!admin || !['ADMIN', 'SUPER_ADMIN'].includes(admin.role)) {
        throw new Error('Insufficient permissions');
    }

    // Generate unique email and password
    const email = teacherData.email || `teacher.${teacherData.name.toLowerCase().replace(/\s+/g, '.')}@arwaeduc.local`;
    const password = `teacher${Math.floor(Math.random() * 10000)}`;
    const hashedPassword = await hashPassword(password);

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
        where: { email: email }
    });

    if (existingUser) {
        throw new Error('Email already exists');
    }

    // Create teacher user account
    const teacherUser = await prisma.user.create({
        data: {
            email: email,
            password: hashedPassword,
            name: teacherData.name,
            role: 'TEACHER',
            teacherGroupIds: teacherData.groupIds,
            gsm: teacherData.phone
        }
    });

    return {
        teacherUser: {
            id: teacherUser.id,
            email: teacherUser.email,
            name: teacherUser.name,
            role: teacherUser.role
        },
        credentials: {
            email: email,
            password: password // Return plain password for admin to give to teacher
        }
    };
};

// Update teacher credentials (admin can change like secretary login)
export const updateTeacherCredentials = async (teacherId: string, updateData: {
    email?: string;
    password?: string;
    name?: string;
    groupIds?: string[];
}, adminId: string) => {
    // Check if admin has permission
    const admin = await prisma.user.findUnique({
        where: { id: adminId },
    });

    if (!admin || !['ADMIN', 'SUPER_ADMIN'].includes(admin.role)) {
        throw new Error('Insufficient permissions');
    }

    // Find teacher
    const teacher = await prisma.user.findUnique({
        where: { id: teacherId }
    });

    if (!teacher || teacher.role !== 'TEACHER') {
        throw new Error('Teacher not found');
    }

    // Prepare update data
    const updatedData: any = {};
    
    if (updateData.email) {
        // Check if new email already exists
        const existingUser = await prisma.user.findFirst({
            where: { 
                email: updateData.email,
                NOT: { id: teacherId }
            }
        });

        if (existingUser) {
            throw new Error('Email already exists');
        }
        updatedData.email = updateData.email;
    }

    if (updateData.password) {
        updatedData.password = await hashPassword(updateData.password);
    }

    if (updateData.name) {
        updatedData.name = updateData.name;
    }

    if (updateData.groupIds) {
        updatedData.teacherGroupIds = updateData.groupIds;
    }

    // Update teacher
    const updatedTeacher = await prisma.user.update({
        where: { id: teacherId },
        data: updatedData,
        select: {
            id: true,
            email: true,
            name: true,
            role: true,
            teacherGroupIds: true
        }
    });

    return {
        teacherUser: updatedTeacher,
        message: 'Teacher credentials updated successfully'
    };
};

// Get all student/parent/teacher accounts for admin management
export const getUserAccounts = async (adminId: string) => {
    // Check if admin has permission
    const admin = await prisma.user.findUnique({
        where: { id: adminId },
    });

    if (!admin || !['ADMIN', 'SUPER_ADMIN'].includes(admin.role)) {
        throw new Error('Insufficient permissions');
    }

    const students = await prisma.user.findMany({
        where: { role: 'STUDENT' },
        include: {
            student: {
                select: {
                    id: true,
                    name: true,
                    surname: true,
                    phone: true
                }
            }
        }
    });

    const parents = await prisma.user.findMany({
        where: { role: 'PARENT' },
        include: {
            parentStudent: {
                select: {
                    id: true,
                    name: true,
                    surname: true,
                    phone: true
                }
            }
        }
    });

    const teachers = await prisma.user.findMany({
        where: { role: 'TEACHER' },
        include: {
            teacherGroups: {
                select: {
                    id: true,
                    name: true,
                    subject: true
                }
            }
        }
    });

    return {
        students: students.map((user: any) => ({
            id: user.id,
            email: user.email,
            name: user.name,
            createdAt: user.createdAt,
            student: user.student
        })),
        parents: parents.map((user: any) => ({
            id: user.id,
            email: user.email,
            name: user.name,
            createdAt: user.createdAt,
            student: user.parentStudent
        })),
        teachers: teachers.map((user: any) => ({
            id: user.id,
            email: user.email,
            name: user.name,
            createdAt: user.createdAt,
            groups: user.teacherGroups
        }))
    };
};