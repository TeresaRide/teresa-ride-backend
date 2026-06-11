import { Router } from "express";
import {getAll, getById, create, update, remove} from "../controllers/vehicles.controller";
import { upload } from "../middlewares/upload";

const router = Router();

router.get("/", getAll);
router.get("/:id", getById);
router.post("/", upload.single('image'), create);
router.put("/:id", upload.single('image'), update);
router.delete("/:id", remove);

export default router;