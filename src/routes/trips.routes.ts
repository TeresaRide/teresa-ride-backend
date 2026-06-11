import { Router } from "express";
import {getAll, getById, create, update, remove} from "../controllers/trips.controller";
import { uploadTripImage } from "../middlewares/uploadTrips";
const router = Router();

router.get("/", getAll);
router.get("/:id", getById);
router.post("/", uploadTripImage.single('image'), create);
router.put("/:id", uploadTripImage.single('image'), update);
router.delete("/:id", remove);

export default router;