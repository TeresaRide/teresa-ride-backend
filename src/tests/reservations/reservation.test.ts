jest.mock('../../config/db');

import db from '../../config/db';
import * as reservationService from '../../services/resevations.service';
import { Reservation } from '../../models/reservation.model';

const queryMock = (db as unknown as { query: jest.Mock }).query;

describe('reservation.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  
  test('getUserReservations retorna lista', async () => {
    const rows: Reservation[] = [
      {
        id_reservation: 1,
        id_document: 'ABC123',
        id_trip: 2,
        license_plate: null,
        date_reservacion: '2025-11-01',
        total_amount: 100,
        is_active: true,
        final_date: '2025-11-05',
      },
    ];
    queryMock.mockImplementation((sql: string, params: any[], cb: Function) => cb(null, [rows]));

    const res = await reservationService.getUserReservations('ABC123');

    expect(queryMock).toHaveBeenCalledWith('CALL sp_get_user_reservations(?)', ['ABC123'], expect.any(Function));
    expect(res).toEqual(rows);
  });

  
  test('createReservation inserta y retorna nuevo id', async () => {
    const result = [{ new_reservation_id: 10, total_amount: 200 }];
    queryMock.mockImplementation((sql: string, params: any[], cb: Function) => cb(null, [result]));

    const res = await reservationService.createReservation({
      id_document: 'ABC123',
      type: 'trip',
      id_trip: 2,
      total_amount: 200,
      date_reservacion: '2025-12-01',
      payment_method: 'card',
      transaction_code: 'XYZ123',
      currency: 'USD',
    });

    expect(queryMock).toHaveBeenCalledWith(
      'CALL sp_create_reservation(?,?,?,?,?,?,?,?,?,?)',
      ['ABC123','trip',2,null,200,'2025-12-01',null,'card','XYZ123','USD'],
      expect.any(Function)
    );
    expect(res).toEqual(result[0]);
  });

  test('updateReservationDates actualiza y retorna información', async () => {
    const result = [{ updated_reservation_id: 1, reservation_type: 'trip', new_start_date: '2025-12-10', new_end_date: '2025-12-15' }];
    queryMock.mockImplementation((sql: string, params: any[], cb: Function) => cb(null, [result]));

    const res = await reservationService.updateReservationDates(1, { new_date_reservacion: '2025-12-10', new_final_date: '2025-12-15' });

    expect(queryMock).toHaveBeenCalledWith(
      'CALL sp_update_reservation_dates(?,?,?)',
      [1,'2025-12-10','2025-12-15'],
      expect.any(Function)
    );
    expect(res).toEqual(result[0]);
  });

  // cancelReservation
  test('cancelReservation resuelve correctamente', async () => {
    const result = [{ cancelled_reservation_id: 1, message: 'Reservation cancelled' }];
    queryMock.mockImplementation((sql: string, params: any[], cb: Function) => cb(null, [result]));

    const res = await reservationService.cancelReservation(1);

    expect(queryMock).toHaveBeenCalledWith('CALL sp_cancel_reservation(?)', [1], expect.any(Function));
    expect(res).toEqual(result);
  });

  // getReservationWithoutReview
  test('getReservationWithoutReview retorna reserva o null', async () => {
    const row: Reservation = {
      id_reservation: 5,
      id_document: 'XYZ',
      id_trip: 3,
      license_plate: null,
      date_reservacion: '2025-12-01',
      total_amount: 150,
      is_active: true,
      final_date: '2025-12-05',
    };
    queryMock.mockImplementation((sql: string, params: any[], cb: Function) => cb(null, [[row]]));

    const res = await reservationService.getReservationWithoutReview('XYZ');

    expect(queryMock).toHaveBeenCalledWith('CALL sp_get_reservation_without_review(?)', ['XYZ'], expect.any(Function));
    expect(res).toEqual(row);
  });

  test('getReservationWithoutReview retorna null si no hay reservas', async () => {
    queryMock.mockImplementation((sql: string, params: any[], cb: Function) => cb(null, [[]]));

    const res = await reservationService.getReservationWithoutReview('ABC');

    expect(res).toBeNull();
  });

  // getReservationById
  test('getReservationById retorna reserva o null', async () => {
    const row: Reservation = {
      id_reservation: 10,
      id_document: 'ABC',
      id_trip: null,
      license_plate: 'XYZ123',
      date_reservacion: '2025-12-01',
      total_amount: 300,
      is_active: true,
      final_date: '2025-12-05',
    };
    queryMock.mockImplementation((sql: string, params: any[], cb: Function) => cb(null, [row]));

    const res = await reservationService.getReservationById(10);

    expect(queryMock).toHaveBeenCalledWith('SELECT * FROM `Reservation` WHERE id_reservation = ? LIMIT 1', [10], expect.any(Function));
    expect(res).toEqual(row);
  });

  test('getReservationById retorna null si no hay resultados', async () => {
    queryMock.mockImplementation((sql: string, params: any[], cb: Function) => cb(null, []));

    const res = await reservationService.getReservationById(999);

    expect(res).toBeNull();
  });
});
