import { Request, Response } from "express";
import fs from 'fs';
import * as tripsController from '../../controllers/trips.controller';
import * as tripService from '../../services/trips.service';

jest.mock('../../services/trips.service', () => ({
  __esModule: true,
  getAllTrips: jest.fn(),
  getTripById: jest.fn(),
  createTrip: jest.fn(),
  updateTrip: jest.fn(),
  deleteTrip: jest.fn(),
}));

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

describe('trips.controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('getAll retorna 200 con lista', async () => {
    (tripService.getAllTrips as jest.Mock).mockResolvedValue([{ id_trip: 1, origin: 'A', destination: 'B', price: 100, start_date: '2025-01-01', final_date: '2025-01-02', people_count: 2, description: 'desc', image: '' }]);
    const req = {} as Request;
    const res = createRes();
    await tripsController.getAll(req, res as any);
    expect(res.json).toHaveBeenCalledWith([{ id_trip: 1, origin: 'A', destination: 'B', price: 100, start_date: '2025-01-01', final_date: '2025-01-02', people_count: 2, description: 'desc', image: '' }]);
  });

  test('getAll maneja error 500', async () => {
    (tripService.getAllTrips as jest.Mock).mockRejectedValue(new Error('x'));
    const req = {} as Request;
    const res = createRes();
    await tripsController.getAll(req, res as any);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  test('getById retorna 200 con item', async () => {
    (tripService.getTripById as jest.Mock).mockResolvedValue({ id_trip: 1, origin: 'X', destination: 'Y', price: 50, start_date: '2025-01-01', final_date: '2025-01-02', people_count: 3, description: 'desc', image: '' });
    const req = { params: { id: '1' } } as unknown as Request;
    const res = createRes();
    await tripsController.getById(req, res as any);
    expect(res.json).toHaveBeenCalledWith({ id_trip: 1, origin: 'X', destination: 'Y', price: 50, start_date: '2025-01-01', final_date: '2025-01-02', people_count: 3, description: 'desc', image: '' });
  });

  test('getById maneja 404', async () => {
    (tripService.getTripById as jest.Mock).mockRejectedValue(new Error('not found'));
    const req = { params: { id: 'NO' } } as unknown as Request;
    const res = createRes();
    await tripsController.getById(req, res as any);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('create convierte tipos y retorna 201', async () => {
    const req = {
      file: { filename: 'f.jpg' },
      body: {
        origin: 'O',
        destination: 'D',
        price: '100',
        start_date: '2025-01-01',
        final_date: '2025-01-02',
        people_count: '4',
        description: 'desc',
      },
    } as unknown as Request;

    const expected = {
      id_trip: 0,
      origin: 'O',
      destination: 'D',
      price: 100,
      start_date: '2025-01-01',
      final_date: '2025-01-02',
      people_count: 4,
      description: 'desc',
      image: '/uploads/trips/f.jpg',
    };

    (tripService.createTrip as jest.Mock).mockResolvedValue(expected);
    const res = createRes();
    await tripsController.create(req, res as any);

    expect(tripService.createTrip).toHaveBeenCalledWith(expected);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expected);
  });

  test('update convierte tipos y retorna 200', async () => {
    const req = {
      params: { id: '1' },
      file: { filename: 'g.png' },
      body: {
        origin: 'NO',
        destination: 'ND',
        price: '200',
        start_date: '2025-02-01',
        final_date: '2025-02-02',
        people_count: '5',
        description: 'desc updated',
      },
    } as unknown as Request;

    const updateData = {
      origin: 'NO',
      destination: 'ND',
      price: 200,
      start_date: '2025-02-01',
      final_date: '2025-02-02',
      people_count: 5,
      description: 'desc updated',
      image: '/uploads/trips/g.png',
    };

    const updated = { id_trip: 1, ...updateData };
    (tripService.updateTrip as jest.Mock).mockResolvedValue(updated);
    const res = createRes();
    await tripsController.update(req, res as any);

    expect(tripService.updateTrip).toHaveBeenCalledWith('1', updateData);
    expect(res.json).toHaveBeenCalledWith(updated);
  });

  test('update maneja 404', async () => {
    (tripService.updateTrip as jest.Mock).mockRejectedValue(new Error('not found'));
    const req = { params: { id: 'NO' }, body: {} } as unknown as Request;
    const res = createRes();
    await tripsController.update(req, res as any);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('remove borra y retorna 204', async () => {
    (tripService.getTripById as jest.Mock).mockResolvedValue({ id_trip: 1, image: '' });
    (tripService.deleteTrip as jest.Mock).mockResolvedValue(undefined);
    const res = createRes();
    const req = { params: { id: '1' } } as unknown as Request;
    await tripsController.remove(req, res as any);

    expect(tripService.deleteTrip).toHaveBeenCalledWith('1');
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalled();
  });

  test('remove maneja 404', async () => {
    (tripService.deleteTrip as jest.Mock).mockRejectedValue(new Error('not found'));
    const res = createRes();
    const req = { params: { id: 'NO' } } as unknown as Request;
    await tripsController.remove(req, res as any);
    expect(res.status).toHaveBeenCalledWith(404);
  });
});
