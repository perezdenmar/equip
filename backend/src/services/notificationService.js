import prisma from '../lib/prisma.js';
import { sendAdminStaffNotificationEmail } from './emailService.js';

/**
 * Notify all Admins and Staff about a new student registration.
 */
export const notifyNewStudentRegistration = async (student) => {
    try {
        const adminsAndStaff = await prisma.user.findMany({
            where: {
                role: { in: ['ADMIN', 'STAFF'] }
            }
        });

        const studentName = student.firstName && student.lastName
            ? `${student.firstName} ${student.lastName}`
            : student.email;

        const title = 'New Student Registered';
        const message = `A new student, ${studentName}, has just joined EQUIP.`;

        // Create in-app notifications
        await Promise.all(adminsAndStaff.map(user =>
            prisma.notification.create({
                data: {
                    userId: user.id,
                    title,
                    message,
                    type: 'INFO'
                }
            })
        ));

        // Send emails
        if (adminsAndStaff.length > 0) {
            await sendAdminStaffNotificationEmail({
                recipients: adminsAndStaff.map(u => u.email),
                subject: `[EQUIP Alert] New Student Registration: ${studentName}`,
                body: `
                    <p>A new student has registered on the EQUIP platform.</p>
                    <ul>
                        <li><strong>Name:</strong> ${studentName}</li>
                        <li><strong>Email:</strong> ${student.email}</li>
                        <li><strong>Joined:</strong> ${new Date().toLocaleString()}</li>
                    </ul>
                    <p><a href="https://equipdigos.com/students">View Students Directory</a></p>
                `
            });
        }
    } catch (error) {
        console.error('Error in notifyNewStudentRegistration:', error);
    }
};

/**
 * Helper to fetch notification configuration.
 */
const getNotificationConfig = async () => {
    try {
        const setting = await prisma.siteSetting.findUnique({
            where: { key: 'notification_config' }
        });
        return setting?.value || {};
    } catch (error) {
        console.error('Error fetching notification config:', error);
        return {};
    }
};

/**
 * Notify Admins, Staff, and assigned Trainers about a qualification-related action.
 * Now honors dynamic settings from the Notification Dashboard.
 */
export const notifyQualificationAction = async (student, qualificationId, actionType) => {
    try {
        const config = await getNotificationConfig();
        const actionConfig = config[actionType] || { inApp: true, email: true, recipients: ['ADMIN'] };

        // If both channels are disabled, skip early
        if (!actionConfig.inApp && !actionConfig.email) return;

        const qualification = await prisma.qualification.findUnique({
            where: { id: qualificationId },
            include: { trainers: true }
        });

        if (!qualification) return;

        // Resolve recipients based on config
        let recipientRoles = actionConfig.recipients || ['ADMIN'];
        let targetUsers = [];

        const adminStaff = await prisma.user.findMany({
            where: {
                role: { in: recipientRoles.filter(r => ['ADMIN', 'STAFF'].includes(r)) }
            }
        });

        targetUsers = [...adminStaff];

        if (recipientRoles.includes('TRAINER')) {
            targetUsers = [...targetUsers, ...qualification.trainers];
        }

        // Remove duplicates
        const uniqueRecipients = Array.from(new Set(targetUsers.map(u => u.id)))
            .map(id => targetUsers.find(u => u.id === id));

        if (uniqueRecipients.length === 0) return;

        const studentName = (student.firstName || student.lastName)
            ? `${student.firstName || ''} ${student.lastName || ''}`.trim()
            : student.email;

        const isEnrollment = actionType === 'ENROLLMENT_REQUEST';
        const title = isEnrollment ? 'New Enrollment Request' : 'Qualification Wishlisted';
        const message = isEnrollment
            ? `${studentName} requested enrollment for ${qualification.title}.`
            : `${studentName} added ${qualification.title} to their wishlist.`;

        // Create in-app notifications if enabled
        if (actionConfig.inApp) {
            await Promise.all(uniqueRecipients.map(user =>
                prisma.notification.create({
                    data: {
                        userId: user.id,
                        title,
                        message,
                        type: isEnrollment ? 'WARNING' : 'INFO'
                    }
                })
            ));
        }

        // Send emails if enabled
        if (actionConfig.email) {
            await sendAdminStaffNotificationEmail({
                recipients: uniqueRecipients.map(u => u.email),
                subject: `[EQUIP Alert] ${title}: ${qualification.title}`,
                body: `
                    <p>${message}</p>
                    <div style="background: #f9fafb; padding: 15px; border-radius: 6px; margin: 20px 0;">
                        <p style="margin: 0 0 10px 0;"><strong>Student:</strong> ${studentName} (${student.email})</p>
                        <p style="margin: 0;"><strong>Course:</strong> ${qualification.title} (${qualification.code})</p>
                    </div>
                    <p><a href="https://equipdigos.com/${isEnrollment ? 'enrollments' : 'qualifications'}">Manage ${isEnrollment ? 'Enrollments' : 'Qualifications'}</a></p>
                `
            });
        }
    } catch (error) {
        console.error('Error in notifyQualificationAction:', error);
    }
};
