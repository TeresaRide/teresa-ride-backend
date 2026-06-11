import { Request, Response } from 'express';
import * as notificationService from '../services/notification.service';

export const getAllNotifications = async (req: Request, res: Response) => {
    try {
        const notifications = await notificationService.getAllNotifications();
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving notifications', error });
    }
};

export const getNotificationById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const notification = await notificationService.getNotificationById(Number(id));
        res.json(notification);
    } catch (error) {
        res.status(404).json({ message: 'Notification not found', error });
    }
};

export const createNotification = async (req: Request, res: Response) => {
    try {
        let notificationData = req.body;
        if (req.file) {
            notificationData.attachment_path = req.file.filename;
        }
        const notification = await notificationService.createNotification(notificationData);
        res.status(201).json(notification);
    } catch (error) {
        res.status(400).json({ message: 'Error creating notification', error });
    }
};

export const updateNotification = async (req: Request, res: Response) => {
    try {
        let notificationData = req.body;
        if (req.file) {
            notificationData.attachment_path = req.file.filename;
        }
        const { id } = req.params;
        const notification = await notificationService.updateNotification(Number(id), notificationData);
        res.json(notification);
    } catch (error) {
        res.status(400).json({ message: 'Error updating notification', error });
    }
};

export const deleteNotification = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await notificationService.deleteNotification(Number(id));
        res.status(204).send();
    } catch (error) {
        res.status(400).json({ message: 'Error deleting notification', error });
    }
};

export const sendPaymentConfirmation = async (req: Request, res: Response) => {
    try {
        const { email, paymentDetails, email_subject, description, shipping_date} = req.body;
        const attachment_path = req.file ? req.file.filename : undefined;

        let paymentObj = paymentDetails;
        if (typeof paymentDetails === 'string') {
            try {
                paymentObj = JSON.parse(paymentDetails);
            } catch {
                return res.status(400).json({ message: "Invalid paymentDetails format." });
            }
        }

        if (!email || !paymentObj?.amount) {
            return res.status(400).json({ message: "Email and payment details are required." });
        }

        const notification = {
            email_subject: email_subject || "Payment Confirmation",
            description: description || `Your payment of $${paymentObj.amount} has been confirmed.`,
            shipping_date: shipping_date ? new Date(shipping_date) : new Date(),
            type: "PAYMENT_CONFIRMATION",
            attachment_path
        };
        await notificationService.createNotification(notification);
        await notificationService.sendEmail(
            email,
            notification.email_subject,
            notification.description,
            attachment_path
                ? [{ filename: attachment_path, path: `uploads/notifications/${attachment_path}` }]
                : undefined
        );

        return res.status(200).json({ message: "Payment confirmation sent successfully." });
    } catch (error: any) {
        console.error("Error sending payment confirmation:", error);
        return res.status(500).json({ message: "Error sending payment confirmation." });
    }
};

export const sendTripReminder = async (req: Request, res: Response) => {
    try {
        const { email, tripDetails, email_subject, description, shipping_date } = req.body;
        const attachment_path = req.file ? req.file.filename : undefined;

        let tripObj = tripDetails;
        if (typeof tripDetails === 'string') {
            try {
                tripObj = JSON.parse(tripDetails);
            } catch {
                return res.status(400).json({ message: "Invalid tripDetails format." });
            }
        }

        if (!email || !tripObj?.destination) {
            return res.status(400).json({
                message: "Email and trip destination are required.",
            });
        }
        const notification = {
            email_subject: email_subject || "Trip Reminder",
            description: description || `Reminder: Your trip to ${tripObj.destination} is coming up soon.`,
            shipping_date: shipping_date ? new Date(shipping_date) : new Date(),
            type: "TRIP_REMINDER",
            attachment_path
        };
        await notificationService.createNotification(notification);
        await notificationService.sendEmail(
            email,
            notification.email_subject,
            notification.description,
            attachment_path
                ? [{ filename: attachment_path, path: `uploads/notifications/${attachment_path}` }]
                : undefined
        );
        return res.status(200).json({
            message: "Trip reminder sent successfully.",
        });
    } catch (error: any) {
        console.error("Error sending trip reminder:", error);
        return res.status(500).json({
            message: "Error sending trip reminder.",
            error: error.message || error,
        });
    }
};