import { Request, Response } from 'express';

jest.mock('../../services/vehicles.service', () => ({
  __esModule: true,
  getAllVehicles: jest.fn(),
  getVehicleById: jest.fn(),
  createVehicle: jest.fn(),
  updateVehicle: jest.fn(),
  deleteVehicle: jest.fn(),
}));

import * as vehiclesController from '../../controllers/vehicles.controller';
import * as vehicleService from '../../services/vehicles.service';

type ResMock = Pick<Response, 'status' | 'json' | 'send'> & { statusCode?: number };
const createRes = (): ResMock => {
  const res: any = {};
  res.status = jest.fn().mockImplementation((code: number) => {
    res.statusCode = code;
    return res;
  });
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

describe('vehicles.controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('getAll retorna 200 con lista', async () => {
    (vehicleService.getAllVehicles as jest.Mock).mockResolvedValue([{ license_plate: 'A' }]);
    const req = {} as Request;
    const res = createRes();
    await vehiclesController.getAll(req, res as any);
    expect(res.json).toHaveBeenCalledWith([{ license_plate: 'A' }]);
  });

  test('getAll maneja error 500', async () => {
    (vehicleService.getAllVehicles as jest.Mock).mockRejectedValue(new Error('x'));
    const req = {} as Request;
    const res = createRes();
    await vehiclesController.getAll(req, res as any);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  test('getById retorna 200 con item', async () => {
    (vehicleService.getVehicleById as jest.Mock).mockResolvedValue({ license_plate: 'X' });
    const req = { params: { id: 'X' } } as unknown as Request;
    const res = createRes();
    await vehiclesController.getById(req, res as any);
    expect(res.json).toHaveBeenCalledWith({ license_plate: 'X' });
  });

  test('getById maneja 404', async () => {
    (vehicleService.getVehicleById as jest.Mock).mockRejectedValue(new Error('not found'));
    const req = { params: { id: 'NO' } } as unknown as Request;
    const res = createRes();
    await vehiclesController.getById(req, res as any);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('create convierte tipos y retorna 201', async () => {
    const req = {
      file: { filename: 'f.jpg' },
      body: {
        license_plate: 'LP',
        brand: 'B',
        model: 'M',
        capacity: '4',
        is_active: 'true',
        model_year: '2023',
        description: 'd',
        price_per_day: '25',
      },
    } as unknown as Request;

    const expected = {
      license_plate: 'LP',
      brand: 'B',
      model: 'M',
      capacity: 4,
      image: '/uploads/vehicles/f.jpg',
      is_active: true,
      model_year: 2023,
      description: 'd',
      price_per_day: 25,
    };

    (vehicleService.createVehicle as jest.Mock).mockResolvedValue(expected);
    const res = createRes();
    await vehiclesController.create(req, res as any);

    expect(vehicleService.createVehicle).toHaveBeenCalledWith(expected);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expected);
  });

  test('update convierte tipos y retorna 200', async () => {
    const req = {
      params: { id: 'LP' },
      file: { filename: 'g.png' },
      body: {
        brand: 'NB',
        model: 'NM',
        capacity: '6',
        is_active: 'false',
        model_year: '2024',
      },
    } as unknown as Request;

    const updateData = {
      brand: 'NB',
      model: 'NM',
      capacity: 6,
      image: '/uploads/vehicles/g.png',
      is_active: false,
      model_year: 2024,
    };

    const updated = { license_plate: 'LP', ...updateData, description: 'd', price_per_day: 10 };
    (vehicleService.updateVehicle as jest.Mock).mockResolvedValue(updated);
    const res = createRes();
    await vehiclesController.update(req, res as any);

    expect(vehicleService.updateVehicle).toHaveBeenCalledWith('LP', updateData);
    expect(res.json).toHaveBeenCalledWith(updated);
  });

  test('update maneja 404', async () => {
    (vehicleService.updateVehicle as jest.Mock).mockRejectedValue(new Error('not found'));
    const req = { params: { id: 'NO' }, body: {} } as unknown as Request;
    const res = createRes();
    await vehiclesController.update(req, res as any);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('remove borra y retorna 204', async () => {
    (vehicleService.getVehicleById as jest.Mock).mockResolvedValue({
      license_plate: 'LP',
      image: '',
    });
    (vehicleService.deleteVehicle as jest.Mock).mockResolvedValue(undefined);
    const res = createRes();
    const req = { params: { id: 'LP' } } as unknown as Request;
    await vehiclesController.remove(req, res as any);

    expect(vehicleService.deleteVehicle).toHaveBeenCalledWith('LP');
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalled();
  });

  test('remove maneja 404', async () => {
    (vehicleService.deleteVehicle as jest.Mock).mockRejectedValue(new Error('not found'));
    const res = createRes();
    const req = { params: { id: 'NO' } } as unknown as Request;
    await vehiclesController.remove(req, res as any);
    expect(res.status).toHaveBeenCalledWith(404);
  });
});