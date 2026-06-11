import { Router } from "express";
import {getUserReservations,createReservation,updateReservationDates,cancelReservation,getReservationWithoutReview, getReservationById} from "../controllers/reservation.controller";
const router = Router();

router.get("/:id_document", getUserReservations);
router.post("/", createReservation);
router.put("/:id",updateReservationDates);
router.delete("/:id", cancelReservation);
router.get("/without-review/:id_document", getReservationWithoutReview);
router.get("/getById/:id", getReservationById);

export default router;