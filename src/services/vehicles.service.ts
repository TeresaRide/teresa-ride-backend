import db from '../config/db';
import { Vehicle } from '../models/vehicle.model';

export const getAllVehicles = (): Promise<Vehicle[]> => {
    return new Promise((resolve, reject) => {
        db.query('SELECT * FROM Vehicle', (err, results) => {
            if (err) reject(err);
            else resolve(results as Vehicle[]);
        });
    });
};

export const getVehicleById = (id: string): Promise<Vehicle> => {
    return new Promise((resolve, reject) => {
        db.query('SELECT * FROM Vehicle WHERE license_plate = ?', [id], (err, results) => {
            if (err) reject(err);
            else {
                const vehicles = results as Vehicle[];
                if (!Array.isArray(vehicles) || vehicles.length === 0) reject(new Error('Vehicle not found'));
                else resolve(vehicles[0]);
            }
        });
    });
};

export const createVehicle = (vehicle: Vehicle): Promise<Vehicle> => {
    return new Promise((resolve, reject) => {
        const sql = `
          INSERT INTO Vehicle
            (license_plate, brand, model, capacity, image, is_active, model_year, description, price_per_day)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const params = [
            vehicle.license_plate,
            vehicle.brand,
            vehicle.model,
            vehicle.capacity,
            vehicle.image,
            vehicle.is_active,
            vehicle.model_year,
            vehicle.description,
            vehicle.price_per_day
        ];
        db.query(sql, params, (err, result) => {
            if (err) return reject(err);
            resolve(vehicle);
        });
    });
};

export const updateVehicle = (id: string, data: Partial<Vehicle>): Promise<Vehicle> => {
    return new Promise((resolve, reject) => {
        const fields: string[] = [];
        const values: any[] = [];

        if (data.brand !== undefined) { fields.push('brand = ?'); values.push(data.brand); }
        if (data.model !== undefined) { fields.push('model = ?'); values.push(data.model); }
        if (data.capacity !== undefined) { fields.push('capacity = ?'); values.push(data.capacity); }
        if (data.image !== undefined) { fields.push('image = ?'); values.push(data.image); }
        if (data.is_active !== undefined) { fields.push('is_active = ?'); values.push(data.is_active); }
        if (data.model_year !== undefined) { fields.push('model_year = ?'); values.push(data.model_year); }
        if (data.description !== undefined) { fields.push('description = ?'); values.push(data.description); }
        if (data.price_per_day !== undefined) { fields.push('price_per_day = ?'); values.push(data.price_per_day); }

        if (fields.length === 0) return reject(new Error('No fields to update'));

        const sql = `UPDATE Vehicle SET ${fields.join(', ')} WHERE license_plate = ?`;
        values.push(id);

        db.query(sql, values, (err, result) => {
            if (err) return reject(err);
            getVehicleById(id).then(resolve).catch(reject);
        });
    });
};

export const deleteVehicle = (id: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        db.query('DELETE FROM Vehicle WHERE license_plate = ?', [id], (err, result) => {
            if (err) reject(err);
            else if ((result as any).affectedRows === 0) reject(new Error('Vehicle not found'));
            else resolve();
        });
    });
};