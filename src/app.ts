import express, { Application } from "express";
import cors from "cors";
import vehicleRoutes from "./routes/vehicles.routes";
import tripRoutes from "./routes/trips.routes";
import userRoutes from "./routes/users.routes";
import reviewRoutes from "./routes/review.routes";
import notificationRoutes from "./routes/notification.routes";
import reservationRoutes from "./routes/reservations.routes";
const app: Application = express();
app.use(cors());
app.use(express.json());

app.use("/api/vehicles", vehicleRoutes);
app.use("/api/reservations",reservationRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/users", userRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/notifications", notificationRoutes);
export default app;
