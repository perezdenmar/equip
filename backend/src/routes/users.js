import express from 'express';
import prisma from '../lib/prisma.js';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware.js';
import { STRICT_ADMINS } from '../lib/config.js';

const router = express.Router();

// Get all Trainers (for dropdown selection)
// Includes both users with role='TRAINER' and STAFF/ADMIN with isTrainer=true
router.get('/trainers', authenticateToken, authorizeRoles('ADMIN', 'TRAINER', 'STAFF'), async (req, res) => {
    try {
        const trainers = await prisma.user.findMany({
            where: {
                OR: [
                    { role: 'TRAINER' },
                    { isTrainer: true }
                ]
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                contact: true,
                profilePhoto: true,
                role: true,
                isTrainer: true,
                assignedCourses: {
                    select: { id: true, title: true, code: true }
                }
            },
            orderBy: { firstName: 'asc' }
        });
        res.json(trainers);
    } catch (error) {
        console.error('Error fetching trainers:', error);
        res.status(500).json({ error: 'Failed to fetch trainers' });
    }
});

// Admin ONLY: Get all Staff (Teaching & Non-Teaching)
router.get('/staff', authenticateToken, authorizeRoles('ADMIN'), async (req, res) => {
    try {
        const staff = await prisma.user.findMany({
            where: {
                role: { in: ['ADMIN', 'STAFF', 'TRAINER'] }
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true,
                isTrainer: true,
                contact: true,
                createdAt: true
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(staff);
    } catch (error) {
        console.error('Error fetching staff:', error);
        res.status(500).json({ error: 'Failed to fetch staff list' });
    }
});

// Admin ONLY: Create/Invite Staff
router.post('/staff', authenticateToken, authorizeRoles('ADMIN'), async (req, res) => {
    try {
        const { email, firstName, lastName, role, isTrainer, contact } = req.body;

        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            return res.status(400).json({ error: 'User with this email already exists' });
        }

        const newStaff = await prisma.user.create({
            data: {
                email,
                firstName,
                lastName,
                role: role || 'STAFF',
                isTrainer: !!isTrainer,
                contact
            }
        });

        // Create In-App Notification
        try {
            await prisma.notification.create({
                data: {
                    userId: newStaff.id,
                    title: 'Welcome to the Team!',
                    message: `You have been added as ${newStaff.role} to the EQUIP platform.`,
                    type: 'SUCCESS'
                }
            });
        } catch (notifyError) {
            console.error('Failed to create staff notification:', notifyError);
        }

        res.status(201).json(newStaff);
    } catch (error) {
        console.error('Error creating staff:', error);
        res.status(500).json({ error: 'Failed to create staff member' });
    }
});
// Get all Students (with optional search and status filter)
router.get('/students', authenticateToken, authorizeRoles('ADMIN', 'TRAINER'), async (req, res) => {
    try {
        const { search, status } = req.query;
        let whereClause = { role: 'STUDENT' };

        if (search) {
            whereClause.OR = [
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } }
            ];
        }

        if (status && status !== 'ALL') {
            whereClause.studentStatus = status;
        }

        const students = await prisma.user.findMany({
            where: whereClause,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                contact: true,
                studentStatus: true,
                profilePhoto: true,
                createdAt: true
            }
        });
        res.json(students);
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ error: 'Failed to fetch students' });
    }
});

// Update Student Profile Details & Status
router.put('/students/:id', authenticateToken, authorizeRoles('ADMIN', 'TRAINER'), async (req, res) => {
    try {
        const studentId = req.params.id;
        const { firstName, lastName, contact, studentStatus } = req.body;

        const currentStudent = await prisma.user.findUnique({ where: { id: studentId } });
        if (!currentStudent) {
            return res.status(404).json({ error: 'Student not found' });
        }

        // Security check: TRAINERS can only update users with the STUDENT role
        if (req.user.role === 'TRAINER' && currentStudent.role !== 'STUDENT') {
            return res.status(403).json({ error: 'Unauthorized: Trainers can only update student accounts.' });
        }

        const updatedStudent = await prisma.user.update({
            where: { id: studentId },
            data: { firstName, lastName, contact, studentStatus }
        });

        // If status changed, log it in AuditLog and trigger notification
        if (studentStatus && currentStudent.studentStatus !== studentStatus) {
            await prisma.auditLog.create({
                data: {
                    userId: req.user.userId,
                    action: 'UPDATE_STUDENT_STATUS',
                    details: `Changed student ${updatedStudent.email} status from ${currentStudent.studentStatus} to ${studentStatus}`
                }
            });

            // Create In-App Notification
            try {
                await prisma.notification.create({
                    data: {
                        userId: studentId,
                        title: 'Account Status Updated',
                        message: `Your student status has been updated to ${studentStatus.toLowerCase()}.`,
                        type: 'INFO'
                    }
                });
            } catch (notifyError) {
                console.error('Failed to create student update notification:', notifyError);
            }
        }

        res.json(updatedStudent);
    } catch (error) {
        console.error('Error updating student:', error);
        res.status(500).json({ error: 'Failed to update student' });
    }
});

// Delete Student
router.delete('/students/:id', authenticateToken, authorizeRoles('ADMIN'), async (req, res) => {
    try {
        const studentId = req.params.id;

        const currentStudent = await prisma.user.findUnique({ where: { id: studentId } });
        if (currentStudent) {
            await prisma.auditLog.create({
                data: {
                    userId: req.user.userId,
                    action: 'DELETE_STUDENT',
                    details: `Deleted student record: ${currentStudent.email}`
                }
            });
        }

        await prisma.user.delete({
            where: { id: studentId }
        });

        res.json({ message: 'Student deleted successfully' });
    } catch (error) {
        console.error('Error deleting student:', error);
        res.status(500).json({ error: 'Failed to delete student' });
    }
});

// Admin ONLY: Get all users
router.get('/', authenticateToken, authorizeRoles('ADMIN'), async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true,
                createdAt: true
            }
        });
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// Admin ONLY: Create new Trainer proactively
router.post('/trainers', authenticateToken, authorizeRoles('ADMIN'), async (req, res) => {
    try {
        const { firstName, lastName, email, contact, assignedCourseIds } = req.body;

        // Ensure email doesn't already exist
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        // Validation: Max 3 courses
        if (assignedCourseIds && assignedCourseIds.length > 3) {
            return res.status(400).json({ error: 'A trainer can only be assigned to a maximum of 3 courses.' });
        }

        const newTrainer = await prisma.user.create({
            data: {
                email,
                firstName,
                lastName,
                contact,
                role: 'TRAINER',
                assignedCourses: assignedCourseIds && assignedCourseIds.length > 0
                    ? { connect: assignedCourseIds.map(id => ({ id })) }
                    : undefined
            },
            include: {
                assignedCourses: { select: { id: true, title: true, code: true } }
            }
        });

        // Create In-App Notification
        try {
            await prisma.notification.create({
                data: {
                    userId: newTrainer.id,
                    title: 'Welcome, Trainer!',
                    message: `You have been registered as a Trainer. ${newTrainer.assignedCourses.length > 0 ? `Assigned to ${newTrainer.assignedCourses.length} courses.` : ''}`,
                    type: 'SUCCESS'
                }
            });
        } catch (notifyError) {
            console.error('Failed to create trainer notification:', notifyError);
        }

        res.json(newTrainer);
    } catch (error) {
        console.error('Error creating trainer:', error);
        res.status(500).json({ error: 'Failed to create trainer' });
    }
});

// Admin ONLY: Update Trainer details and assignments
router.put('/trainers/:id', authenticateToken, authorizeRoles('ADMIN'), async (req, res) => {
    try {
        const { firstName, lastName, contact, assignedCourseIds } = req.body;

        // Validation: Max 3 courses
        if (assignedCourseIds && assignedCourseIds.length > 3) {
            return res.status(400).json({ error: 'A trainer can only be assigned to a maximum of 3 courses.' });
        }

        const currentTrainer = await prisma.user.findUnique({
            where: { id: req.params.id },
            include: { assignedCourses: true }
        });

        const updatedTrainer = await prisma.user.update({
            where: { id: req.params.id },
            data: {
                firstName,
                lastName,
                contact,
                assignedCourses: assignedCourseIds !== undefined
                    ? { set: assignedCourseIds.map(id => ({ id })) }
                    : undefined
            },
            include: {
                assignedCourses: { select: { id: true, title: true, code: true } }
            }
        });

        // Check if assignments changed
        const oldIds = currentTrainer.assignedCourses.map(c => c.id).sort().join(',');
        const newIds = updatedTrainer.assignedCourses.map(c => c.id).sort().join(',');

        if (oldIds !== newIds) {
            // Create In-App Notification
            try {
                await prisma.notification.create({
                    data: {
                        userId: updatedTrainer.id,
                        title: 'Course Assignments Updated',
                        message: `Your assigned courses have been updated. You are now assigned to ${updatedTrainer.assignedCourses.length} courses.`,
                        type: 'INFO'
                    }
                });
            } catch (notifyError) {
                console.error('Failed to create assignment update notification:', notifyError);
            }
        }

        res.json(updatedTrainer);
    } catch (error) {
        console.error('Error updating trainer:', error);
        res.status(500).json({ error: 'Failed to update trainer' });
    }
});

// Admin ONLY: Update user role or details
router.put('/:id', authenticateToken, authorizeRoles('ADMIN'), async (req, res) => {
    try {
        const { firstName, lastName, role, isTrainer } = req.body;

        const targetUser = await prisma.user.findUnique({ where: { id: req.params.id } });
        if (!targetUser) return res.status(404).json({ error: 'User not found' });

        // Security: Only strict admins can promote someone to ADMIN,
        // and only if the target email is in the strict list.
        if (role === 'ADMIN') {
            if (!STRICT_ADMINS.includes(req.user.email.toLowerCase()) || !STRICT_ADMINS.includes(targetUser.email.toLowerCase())) {
                return res.status(403).json({ error: 'Unauthorized: Admin role is strictly restricted to authorized accounts.' });
            }
        }

        const updatedUser = await prisma.user.update({
            where: { id: req.params.id },
            data: { firstName, lastName, role, isTrainer }
        });

        // Trigger notification if role changed
        if (role && targetUser.role !== role) {
            try {
                await prisma.notification.create({
                    data: {
                        userId: updatedUser.id,
                        title: 'Account Role Updated',
                        message: `Your account role has been updated to ${role}.`,
                        type: 'WARNING'
                    }
                });
            } catch (notifyError) {
                console.error('Failed to create role update notification:', notifyError);
            }
        }

        res.json(updatedUser);
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'Failed to update user' });
    }
});

// Admin ONLY: Delete user
router.delete('/:id', authenticateToken, authorizeRoles('ADMIN'), async (req, res) => {
    try {
        // Prevent admin from deleting their own account
        if (req.params.id === req.user.userId) {
            return res.status(400).json({ error: 'You cannot delete your own account.' });
        }

        await prisma.user.delete({
            where: { id: req.params.id }
        });
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

export default router;

