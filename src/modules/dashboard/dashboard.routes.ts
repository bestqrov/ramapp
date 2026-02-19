import { Router } from 'express';
import {
    getStudentDashboard,
    getParentDashboard,
    getTeacherDashboard,
    getTeacherAttendance,
    postTeacherAttendance,
    getTeacherSchedule
} from './dashboard.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { roleMiddleware } from '../../middlewares/role.middleware';

const router = Router();

// All dashboard routes require authentication
router.use(authMiddleware);

// Student dashboard routes
router.get('/student', roleMiddleware('STUDENT'), getStudentDashboard);

// Parent dashboard routes  
router.get('/parent', roleMiddleware('PARENT'), getParentDashboard);

// Teacher dashboard routes
router.get('/teacher', roleMiddleware('TEACHER'), getTeacherDashboard);
router.get('/teacher/attendance', roleMiddleware('TEACHER'), getTeacherAttendance);
router.post('/teacher/attendance', roleMiddleware('TEACHER'), postTeacherAttendance);
router.get('/teacher/schedule', roleMiddleware('TEACHER'), getTeacherSchedule);

export default router;