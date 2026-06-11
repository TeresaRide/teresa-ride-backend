jest.mock('../../config/db');

import db from '../../config/db';
import * as vehiclesService from '../../services/vehicles.service';
import { Vehicle } from '../../models/vehicle.model';

const queryMock = (db as unknown as { query: jest.Mock }).query;

describe('vehicles.service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('getAllVehicles retorna lista', async () => {
        const rows: Vehicle[] = [
            { license_plate: 'ABC', brand: 'B', model: 'M', capacity: 4, image: '', is_active: true, model_year: 2020, description: 'd', price_per_day: 10 },
        ];
        queryMock.mockImplementation((sql: string, cb: Function) => cb(null, rows));
        const res = await vehiclesService.getAllVehicles();
        expect(queryMock).toHaveBeenCalledWith('SELECT * FROM Vehicle', expect.any(Function));
        expect(res).toEqual(rows);
    });

    test('getAllVhicles retorna lista vacía', async () => {
        queryMock.mockImplementation((sql: string, cb: Function) => cb(null, []));
        const res = await vehiclesService.getAllVehicles();
        expect(queryMock).toHaveBeenCalledWith('SELECT * FROM Vehicle', expect.any(Function));
        expect(res).toEqual([]);
    });

    test('getVehicleById retorna 1 registro', async () => {
        const row: Vehicle = { license_plate: 'XYZ', brand: 'B', model: 'M', capacity: 5, image: '', is_active: true, model_year: 2021, description: 'd', price_per_day: 12 };
        queryMock.mockImplementation((sql: string, params: any[], cb: Function) => cb(null, [row]));
        const res = await vehiclesService.getVehicleById('XYZ');
        expect(queryMock).toHaveBeenCalledWith('SELECT * FROM Vehicle WHERE license_plate = ?', ['XYZ'], expect.any(Function));
        expect(res).toEqual(row);
    });

    test('getVehicleById rechaza si no existe', async () => {
        queryMock.mockImplementation((sql: string, params: any[], cb: Function) => cb(null, []));
        await expect(vehiclesService.getVehicleById('NOPE')).rejects.toThrow('Vehicle not found');
    });

    test('getVehicleById recibe error de BD', async () => {
        const error = new Error('Conecction error with DB');
        queryMock.mockImplementation((sql: string, params: any[], cb: Function) => cb(error));
        await expect(vehiclesService.getVehicleById('XYZ')).rejects.toThrow('Conecction error with DB');
    });

    test('createVehicle inserta y retorna el vehículo', async () => {
        const v: Vehicle = { license_plate: 'NEW', brand: 'B', model: 'M', capacity: 4, image: '', is_active: true, model_year: 2022, description: 'd', price_per_day: 15 };
        queryMock.mockImplementation((sql, params, cb) => cb(null, { affectedRows: 1 }));
        const res = await vehiclesService.createVehicle(v);
        expect(queryMock).toHaveBeenCalled();
        expect(res).toEqual(v);
    });

    test('createVehicle recibe error por placa duplicada', async () => {
        const v: Vehicle = { license_plate: 'DUP', brand: 'B', model: 'M', capacity: 4, image: '', is_active: true, model_year: 2022, description: 'd', price_per_day: 15 };
        const error = new Error('Duplicate license_plate');
        queryMock.mockImplementation((sql, params, cb) => cb(error));
        await expect(vehiclesService.createVehicle(v)).rejects.toThrow('Duplicate license_plate');
    });

    test('updateVehicle actualiza y retorna el vehículo', async () => {
        const existing: Vehicle = {
            license_plate: 'UPD',
            brand: 'B',
            model: 'M',
            capacity: 4,
            image: '',
            is_active: true,
            model_year: 2020,
            description: 'd',
            price_per_day: 10
        };

        const updates: Partial<Vehicle> = { model: 'M2', capacity: 5 };
        queryMock.mockImplementation((sql: string, params: any[], cb: Function) => {
            cb(null, { affectedRows: 1 });
        });
        const spyGet = jest.spyOn(vehiclesService, 'getVehicleById').mockResolvedValue({ ...existing, ...updates });
        const res = await vehiclesService.updateVehicle('UPD', updates);
        expect(queryMock).toHaveBeenCalledWith(
            'UPDATE Vehicle SET model = ?, capacity = ? WHERE license_plate = ?',
            ['M2', 5, 'UPD'],
            expect.any(Function)
        );
        expect(spyGet).toHaveBeenCalledWith('UPD');
        expect(res.model).toBe('M2');
        expect(res.capacity).toBe(5);
    });

    test('updateVehicle rechaza si no hay campos', async () => {
        await expect(vehiclesService.updateVehicle('ID', {})).rejects.toThrow('No fields to update');
    });

    test('updateVehicle lanza error si falla la base de datos', async () => {
        const updates: Partial<Vehicle> = { brand: 'ABC123' };
        const error = new Error('Database connection lost');
        queryMock.mockImplementation((sql: string, params: any[], cb: Function) => cb(error));
        await expect(vehiclesService.updateVehicle('UPD', updates))
            .rejects.toThrow('Database connection lost');
    });

    test('deleteVehicle resuelve cuando affectedRows > 0', async () => {
        queryMock.mockImplementation((sql: string, params: any[], cb: Function) => cb(null, { affectedRows: 1 }));
        await expect(vehiclesService.deleteVehicle('DEL')).resolves.toBeUndefined();
    });

    test('deleteVehicle rechaza cuando affectedRows = 0', async () => {
        queryMock.mockImplementation((sql: string, params: any[], cb: Function) => cb(null, { affectedRows: 0 }));
        await expect(vehiclesService.deleteVehicle('DEL')).rejects.toThrow('Vehicle not found');
    });
});