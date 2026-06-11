
jest.mock('../../config/db');

import db from '../../config/db';
import * as tripsService from '../../services/trips.service';
import { Trip } from '../../models/trip.model';

const queryMock = (db as unknown as { query: jest.Mock }).query;

describe('trips.service', () => {
  beforeEach(() => {
    jest.clearAllMocks(); 
  });

  test('getAllTrips retorna lista', async () => {
    const rows: Trip[] = [
      { id_trip: 1, origin: 'A', destination: 'B', price: 100, start_date: '2025-11-01', final_date: '2025-11-05', people_count: 2, description: 'Viaje de prueba', image: '' },
    ];
    queryMock.mockImplementation((sql: string, cb: Function) => cb(null, rows));

    const res = await tripsService.getAllTrips();

    expect(queryMock).toHaveBeenCalledWith('SELECT * FROM Trip', expect.any(Function));
    expect(res).toEqual(rows);
  });

  test('getTripById retorna 1 registro', async () => {
    const row: Trip = { id_trip: 2, origin: 'C', destination: 'D', price: 150, start_date: '2025-12-01', final_date: '2025-12-03', people_count: 4, description: 'Otro viaje', image: '' };
    queryMock.mockImplementation((sql: string, params: any[], cb: Function) => cb(null, [row]));

    const res = await tripsService.getTripById('2');

    expect(queryMock).toHaveBeenCalledWith('SELECT * FROM Trip WHERE id_trip = ?', ['2'], expect.any(Function));
    expect(res).toEqual(row);
  });

  test('getTripById rechaza si no existe', async () => {
    queryMock.mockImplementation((sql: string, params: any[], cb: Function) => cb(null, []));

    await expect(tripsService.getTripById('999')).rejects.toThrow('Trip not found');
  });

  test('createTrip inserta y retorna el trip', async () => {
    const newTrip: Trip = { id_trip: 3, origin: 'E', destination: 'F', price: 200, start_date: '2025-12-10', final_date: '2025-12-15', people_count: 3, description: 'Viaje nuevo', image: '' };

    queryMock.mockImplementationOnce((sql: string, params: any, cb: Function) => cb(null, { insertId: 3 }));

    queryMock.mockImplementationOnce((sql: string, params: any[], cb: Function) => cb(null, [newTrip]));

    const res = await tripsService.createTrip(newTrip);

    expect(queryMock).toHaveBeenCalledTimes(2); 
    expect(res).toEqual(newTrip);
  });

  test('updateTrip rechaza si no hay registros afectados', async () => {
    queryMock.mockImplementation((sql: string, params: any[], cb: Function) => cb(null, { affectedRows: 0 }));

    await expect(tripsService.updateTrip('1', { price: 250 })).rejects.toThrow('Trip not found');
  });

  test('deleteTrip resuelve cuando affectedRows > 0', async () => {
    queryMock.mockImplementation((sql: string, params: any[], cb: Function) => cb(null, { affectedRows: 1 }));

    await expect(tripsService.deleteTrip('1')).resolves.toBeUndefined();
  });

  test('deleteTrip rechaza cuando affectedRows = 0', async () => {
    queryMock.mockImplementation((sql: string, params: any[], cb: Function) => cb(null, { affectedRows: 0 }));

    await expect(tripsService.deleteTrip('999')).rejects.toThrow('Trip not found');
  });
});
