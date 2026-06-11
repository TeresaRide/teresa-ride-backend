import { Request, Response } from "express";
import { Trip } from "../models/trip.model";
import * as tripService from "../services/trips.service";
import fs from 'fs';
import path from 'path';

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
        const imagePath = file ? `/uploads/trips/${file.filename}` : '';

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
        const imagePath = file ? `/uploads/trips/${file.filename}` : undefined;

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

        // JSKJASJAXNKSJXNA Pruebas mas pruebas gagag shshhss
        if (trip.image) {
            const rel = trip.image.replace(/^\/+/, '');
            const absolute = path.join(__dirname, '..', '..', rel);
            fs.promises.unlink(absolute).catch(err => {
                if (err?.code !== 'ENOENT') console.error('No se po borrar imagen:', err);
            });
        }

        res.status(204).send();
    } catch (error) {
        res.status(404).json({ message: 'Trip not found or error deleting', error });
    }
};
