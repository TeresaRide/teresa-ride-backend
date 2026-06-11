import { Router } from "express";
import { uploadNotification } from '../middlewares/uploadNotification';
import { 
    getAllNotifications,
    getNotificationById,
    createNotification,
    updateNotification,
    deleteNotification,
    sendPaymentConfirmation,
    sendTripReminder
} from "../controllers/notification.controller";

const router = Router();

router.get("/", getAllNotifications);
router.get("/:id", getNotificationById);
router.post("/", uploadNotification.single('file'), createNotification);
router.put("/:id", uploadNotification.single('file'), updateNotification);
router.delete("/:id", deleteNotification);
router.post("/payment-confirmation", uploadNotification.single('file'), sendPaymentConfirmation);
router.post("/trip-reminder", uploadNotification.single('file'), sendTripReminder);

export default router;