import { Router } from "express";
import { getAll, getById, update, remove, registerUser, registerUserAdmin, loginUser, getMe, updateProfile } from "../controllers/users.controller";
import { requireAdmin, requireAuth } from "../middlewares/auth";
import { uploadUserImage } from '../middlewares/uploadUser';

const router = Router();
router.get("/me", requireAuth, getMe);
router.put("/me", requireAuth, uploadUserImage.single('image'), updateProfile);
router.get("/", requireAdmin, getAll);
router.get("/:id", requireAuth, getById);
router.post("/register", registerUser);
router.post("/registerAdmin", requireAdmin, uploadUserImage.single("image"), registerUserAdmin);
router.post("/login", loginUser);
router.put("/:id", requireAuth, uploadUserImage.single("image"), update);
router.delete("/:id", requireAdmin, remove);

export default router;