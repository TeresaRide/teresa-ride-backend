import db from '../config/db';
import { Notification } from '../models/notification.model';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

export const getAllNotifications = (): Promise<Notification[]> => {
    return new Promise((resolve, reject) => {
        db.query('SELECT * FROM notification', (err, results) => {
            if (err) return reject(err);
            if (!results || !Array.isArray(results) || results.length === 0) {
                return reject(new Error('Notification not found'));
            }
            resolve(results as Notification[]);
        });
    });
};

export const getNotificationById = (id: number): Promise<Notification> => {
    return new Promise((resolve, reject) => {
        db.query('SELECT * FROM notification WHERE id_notification = ?', [id], (err, results) => {
            if (err) reject(err);
            const notifications = results as Notification[];
            if (notifications.length === 0) reject(new Error('Notification not found'));
            resolve(notifications[0]);
        });
    });
};

export const createNotification = async (notification: Omit<Notification, 'id_notification'>): Promise<Notification> => {
    return new Promise((resolve, reject) => {
        db.query('INSERT INTO notification SET ?', notification, (err, result) => {
            if (err) return reject(err);
            const insertId = (result as any).insertId;
            getNotificationById(insertId).then(resolve).catch(reject);
        });
    });
};

export const sendEmail = async (
    to: string,
    subject: string,
    html: string,
    attachments?: { filename: string; path: string }[]
) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        html,
        attachments
    };
    return transporter.sendMail(mailOptions);
};

const buildAttachments = (attachmentPath?: string) => {
    if (!attachmentPath) return undefined;
    return [
        {
            filename: attachmentPath,
            path: `uploads/notifications/${attachmentPath}`
        }
    ];
};

export const sendPaymentConfirmation = async (
    email: string,
    notification: Omit<Notification, 'id_notification'>,
    attachmentPath?: string
) => {
    await createNotification(notification);
    await sendEmail(
        email,
        notification.email_subject,
        notification.description,
        buildAttachments(attachmentPath || notification.attachment_path)
    );
};

export const sendTripReminder = async (
    email: string,
    notification: Omit<Notification, 'id_notification'>,
    attachmentPath?: string
) => {
    await createNotification(notification);
    await sendEmail(
        email,
        notification.email_subject,
        notification.description,
        buildAttachments(attachmentPath || notification.attachment_path)
    );
};

export const updateNotification = (id: number, body: Partial<Notification>): Promise<Notification> => {
    return new Promise((resolve, reject) => {
        db.query(
            'UPDATE notification SET ? WHERE id_notification = ?',
            [body, id],
            (err) => {
                if (err) return reject(err);
                getNotificationById(id).then(resolve).catch(reject);
            }
        );
    });
};

export const deleteNotification = (id: number): Promise<void> => {
    return new Promise((resolve, reject) => {
        db.query(
            'DELETE FROM notification WHERE id_notification = ?',
            [id],
            (err) => {
                if (err) return reject(err);
                resolve();
            }
        );
    });
};

