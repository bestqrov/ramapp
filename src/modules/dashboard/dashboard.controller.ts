import { Request, Response } from 'express';
import { sendSuccess, sendError } from '../../utils/response';
import { AuthRequest } from '../../middlewares/auth.middleware';
import {
    getStudentDashboardData,
    getParentDashboardData,
    getTeacherDashboardData,
    getTeacherAttendanceData,
    saveAttendance,
    getTeacherScheduleData
} from './dashboard.service';

export const getStudentDashboard = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        
        if (!userId) {
            sendError(res, 'User not authenticated', 'Authentication required', 401);
            return;
        }

        if (req.user?.role !== 'STUDENT') {
            sendError(res, 'Access denied', 'Student role required', 403);
            return;
        }

        const dashboardData = await getStudentDashboardData(userId);
        sendSuccess(res, dashboardData, 'Student dashboard data retrieved', 200);
    } catch (error: any) {
        sendError(res, error.message, 'Failed to fetch student dashboard data', 500);
    }
};

export const getParentDashboard = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        
        if (!userId) {
            sendError(res, 'User not authenticated', 'Authentication required', 401);
            return;
        }

        if (req.user?.role !== 'PARENT') {
            sendError(res, 'Access denied', 'Parent role required', 403);
            return;
        }

        const dashboardData = await getParentDashboardData(userId);
        sendSuccess(res, dashboardData, 'Parent dashboard data retrieved', 200);
    } catch (error: any) {
        sendError(res, error.message, 'Failed to fetch parent dashboard data', 500);
    }
};

export const getTeacherDashboard = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        
        if (!userId) {
            sendError(res, 'User not authenticated', 'Authentication required', 401);
            return;
        }

        if (req.user?.role !== 'TEACHER') {
            sendError(res, 'Access denied', 'Teacher role required', 403);
            return;
        }

        const dashboardData = await getTeacherDashboardData(userId);
        sendSuccess(res, dashboardData, 'Teacher dashboard data retrieved', 200);
    } catch (error: any) {
        sendError(res, error.message, 'Failed to fetch teacher dashboard data', 500);
    }
};

export const getTeacherAttendance = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        const { date } = req.query;
        
        if (!userId) {
            sendError(res, 'User not authenticated', 'Authentication required', 401);
            return;
        }

        if (req.user?.role !== 'TEACHER') {
            sendError(res, 'Access denied', 'Teacher role required', 403);
            return;
        }

        const attendanceDate = date ? date.toString() : new Date().toISOString().split('T')[0];
        const attendanceData = await getTeacherAttendanceData(userId, attendanceDate);
        sendSuccess(res, attendanceData, 'Teacher attendance data retrieved', 200);
    } catch (error: any) {
        sendError(res, error.message, 'Failed to fetch teacher attendance data', 500);
    }
};

export const postTeacherAttendance = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        const { groupId, date, attendance } = req.body;
        
        if (!userId) {
            sendError(res, 'User not authenticated', 'Authentication required', 401);
            return;
        }

        if (req.user?.role !== 'TEACHER') {
            sendError(res, 'Access denied', 'Teacher role required', 403);
            return;
        }

        if (!groupId || !date || !attendance) {
            sendError(res, 'Missing required fields', 'groupId, date, and attendance are required', 400);
            return;
        }

        const result = await saveAttendance(userId, groupId, date, attendance);
        sendSuccess(res, result, 'Attendance saved successfully', 200);
    } catch (error: any) {
        sendError(res, error.message, 'Failed to save attendance', 500);
    }
};

export const getTeacherSchedule = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        const { week } = req.query;
        
        if (!userId) {
            sendError(res, 'User not authenticated', 'Authentication required', 401);
            return;
        }

        if (req.user?.role !== 'TEACHER') {
            sendError(res, 'Access denied', 'Teacher role required', 403);
            return;
        }

        const weekOffset = week ? parseInt(week.toString()) : 0;
        const scheduleData = await getTeacherScheduleData(userId, weekOffset);
        sendSuccess(res, scheduleData, 'Teacher schedule data retrieved', 200);
    } catch (error: any) {
        sendError(res, error.message, 'Failed to fetch teacher schedule data', 500);
    }
};