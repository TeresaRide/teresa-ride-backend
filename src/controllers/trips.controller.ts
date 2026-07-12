import { Request, Response } from "express";
import { Trip } from "../models/trip.model";
import * as tripService from "../services/trips.service";
import { uploadToCloudinary, deleteFromCloudinary } from "../utils/cloudinary";

export const getAll = async (req: Request, res: Response) => {
    try {
        const trips = await tripService.getAllTrips();
        res.json(trips);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving trips', error });
    }
};

export const getById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const trip = await tripService.getTripById(String(id));
        res.json(trip);
    } catch (error) {
        res.status(404).json({ message: 'Trip not found', error });
    }
};

export const create = async (req: Request, res: Response) => {
    try {
        const file = req.file;
        let imagePath = '';
        if (file) {
            const uploaded = await uploadToCloudinary(file.buffer, 'teresaride/trips');
            imagePath = uploaded.url;
        }

        const payload = req.body;
        const newTrip: Trip = {
            id_trip: 0,
            origin: payload.origin,
            destination: payload.destination,
            price: Number(payload.price),
            start_date: payload.start_date,
            final_date: payload.final_date,
            people_count: Number(payload.people_count),
            description: payload.description,
            image: imagePath
        };

        const trip = await tripService.createTrip(newTrip);
        res.status(201).json(trip);
    } catch (error) {
        res.status(400).json({ message: 'Error creating trip', error });
    }
};

export const update = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const file = req.file;
        let imagePath: string | undefined;
        if (file) {
            const uploaded = await uploadToCloudinary(file.buffer, 'teresaride/trips');
            imagePath = uploaded.url;
        }

        const payload = req.body;
        const updateData: Partial<Trip> = {
            origin: payload.origin,
            destination: payload.destination,
            price: payload.price !== undefined ? Number(payload.price) : undefined,
            start_date: payload.start_date,
            final_date: payload.final_date,
            people_count: payload.people_count !== undefined ? Number(payload.people_count) : undefined,
            description: payload.description,
            image: imagePath || payload.image
        };

        const trip = await tripService.updateTrip(String(id), updateData);
        res.json(trip);
    } catch (error) {
        res.status(404).json({ message: 'Trip not found or error updating', error });
    }
};

export const remove = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const trip = await tripService.getTripById(String(id));
        await tripService.deleteTrip(String(id));

        if (trip.image) {
            await deleteFromCloudinary(trip.image);
        }

        res.status(204).send();
    } catch (error) {
        res.status(404).json({ message: 'Trip not found or error deleting', error });
    }
};
