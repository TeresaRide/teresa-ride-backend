import { Request, Response } from "express";
import { Vehicle } from "../models/vehicle.model";
import * as vehicleService from "../services/vehicles.service";
import fs from 'fs';
import path from 'path';

export const getAll = async (req: Request, res: Response) => {
    try {
        const vehicles = await vehicleService.getAllVehicles();
        res.json(vehicles);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving vehicles', error });
    }
};

export const getById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const vehicle = await vehicleService.getVehicleById(id);
        res.json(vehicle);
    } catch (error) {
        res.status(404).json({ message: 'Vehicle not found', error });
    }
};

export const create = async (req: Request, res: Response) => {
    try {
        const file = req.file;
        const imagePath = file ? `/uploads/vehicles/${file.filename}` : undefined;

        const payload = req.body;
        const newVehicle: Vehicle = {
            license_plate: payload.license_plate,
            brand: payload.brand,
            model: payload.model,
            capacity: Number(payload.capacity),
            image: imagePath || payload.image || '',
            is_active: payload.is_active === 'true' || payload.is_active === true,
            model_year: Number(payload.model_year),
            description: payload.description,
            price_per_day: Number(payload.price_per_day)
        };

        const vehicle = await vehicleService.createVehicle(newVehicle);
        res.status(201).json(vehicle);
    } catch (error) {
        res.status(400).json({ message: 'Error creating vehicle', error });
    }
};

export const update = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const file = req.file;
        const imagePath = file ? `/uploads/vehicles/${file.filename}` : undefined;

        const payload = req.body;
        const updateData: Partial<Vehicle> = {
            brand: payload.brand,
            model: payload.model,
            capacity: payload.capacity !== undefined ? Number(payload.capacity) : undefined,
            image: imagePath || payload.image,
            is_active: payload.is_active !== undefined
                ? (payload.is_active === 'true' || payload.is_active === true)
                : undefined,
            model_year: payload.model_year !== undefined ? Number(payload.model_year) : undefined
        };

        const vehicle = await vehicleService.updateVehicle(id, updateData);
        res.json(vehicle);
    } catch (error) {
        res.status(404).json({ message: 'Vehicle not found or error updating', error });
    }
};

export const remove = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const vehicle = await vehicleService.getVehicleById(id);
        await vehicleService.deleteVehicle(id);
        if (vehicle.image) {
            const rel = vehicle.image.replace(/^\/+/, '');
            const absolute = path.join(__dirname, '..', '..', rel);
            fs.promises.unlink(absolute).catch((err: any) => {
                if (err?.code !== 'ENOENT') console.error('No se pudo borrar imagen:', err);
            });
        }
        res.status(204).send();
    } catch (error) {
        res.status(404).json({ message: 'Vehicle not found or error deleting', error });
    }
};

