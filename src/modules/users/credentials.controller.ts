import { Request, Response } from 'express';
import { sendSuccess, sendError } from '../../utils/response';
import { AuthRequest } from '../../middlewares/auth.middleware';
import {
    createStudentCredentials,
    createParentCredentials,
    createTeacherCredentials,
    updateTeacherCredentials,
    getUserAccounts
} from './credentials.service';

export const createStudentLogin = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { studentId } = req.body;
        const adminId = req.user?.id;

        if (!adminId) {
            sendError(res, 'User not authenticated', 'Authentication required', 401);
            return;
        }

        if (!studentId) {
            sendError(res, 'Student ID is required', 'Validation error', 400);
            return;
        }

        const result = await createStudentCredentials(studentId, adminId);
        sendSuccess(res, result, 'Student login credentials created successfully', 201);
    } catch (error: any) {
        sendError(res, error.message, 'Failed to create student credentials', 400);
    }
};

export const createParentLogin = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { studentId } = req.body;
        const adminId = req.user?.id;

        if (!adminId) {
            sendError(res, 'User not authenticated', 'Authentication required', 401);
            return;
        }

        if (!studentId) {
            sendError(res, 'Student ID is required', 'Validation error', 400);
            return;
        }

        const result = await createParentCredentials(studentId, adminId);
        sendSuccess(res, result, 'Parent login credentials created successfully', 201);
    } catch (error: any) {
        sendError(res, error.message, 'Failed to create parent credentials', 400);
    }
};

export const createTeacherLogin = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { name, email, phone, groupIds } = req.body;
        const adminId = req.user?.id;

        if (!adminId) {
            sendError(res, 'User not authenticated', 'Authentication required', 401);
            return;
        }

        if (!name) {
            sendError(res, 'Teacher name is required', 'Validation error', 400);
            return;
        }

        const teacherData = {
            name,
            email,
            phone,
            groupIds: groupIds || []
        };

        const result = await createTeacherCredentials(teacherData, adminId);
        sendSuccess(res, result, 'Teacher login credentials created successfully', 201);
    } catch (error: any) {
        sendError(res, error.message, 'Failed to create teacher credentials', 400);
    }
};

export const updateTeacherLogin = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { email, password, name, groupIds } = req.body;
        const adminId = req.user?.id;

        if (!adminId) {
            sendError(res, 'User not authenticated', 'Authentication required', 401);
            return;
        }

        const updateData = {
            email,
            password,
            name,
            groupIds
        };

        const result = await updateTeacherCredentials(id, updateData, adminId);
        sendSuccess(res, result, 'Teacher credentials updated successfully', 200);
    } catch (error: any) {
        sendError(res, error.message, 'Failed to update teacher credentials', 400);
    }
};

export const getAllUserAccounts = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const adminId = req.user?.id;

        if (!adminId) {
            sendError(res, 'User not authenticated', 'Authentication required', 401);
            return;
        }

        const accounts = await getUserAccounts(adminId);
        sendSuccess(res, accounts, 'User accounts retrieved successfully', 200);
    } catch (error: any) {
        sendError(res, error.message, 'Failed to retrieve user accounts', 500);
    }
};