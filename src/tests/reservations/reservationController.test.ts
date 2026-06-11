import { Request, Response } from 'express';
import * as reservationController from '../../controllers/reservation.controller';
import * as reservationService from '../../services/resevations.service';

jest.mock('../../services/resevations.service', () => ({
  __esModule: true,
  getUserReservations: jest.fn(),
  createReservation: jest.fn(),
  updateReservationDates: jest.fn(),
  cancelReservation: jest.fn(),
  getReservationWithoutReview: jest.fn(),
  getReservationById: jest.fn(),
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

describe('reservations.controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {}); // Evita logs de error en tests
  });

  test('getUserReservations retorna 200 con lista', async () => {
    const reservations = [{ id_reservation: 1, id_document: '123', date_reservacion: '2025-10-27', total_amount: 100, is_active: true, final_date: '2025-10-28' }];
    (reservationService.getUserReservations as jest.Mock).mockResolvedValue(reservations);

    const req = { params: { id_document: '123' } } as unknown as Request;
    const res = createRes();

    await reservationController.getUserReservations(req, res as any);
    expect(res.json).toHaveBeenCalledWith(reservations);
  });

  test('getUserReservations maneja 404 si no hay reservas', async () => {
    (reservationService.getUserReservations as jest.Mock).mockResolvedValue([]);
    const req = { params: { id_document: '123' } } as unknown as Request;
    const res = createRes();
    await reservationController.getUserReservations(req, res as any);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('getUserReservations maneja 500', async () => {
    (reservationService.getUserReservations as jest.Mock).mockRejectedValue(new Error('x'));
    const req = { params: { id_document: '123' } } as unknown as Request;
    const res = createRes();
    await reservationController.getUserReservations(req, res as any);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  test('createReservation retorna 201', async () => {
    const req = {
      body: {
        id_document: '123',
        type: 'trip',
        id_trip: 1,
        total_amount: 100,
        date_reservacion: '2025-10-27',
        payment_method: 'card',
        transaction_code: 'abc',
        currency: 'USD',
      },
    } as unknown as Request;

    const expected = { id_reservation: 1, ...req.body };
    (reservationService.createReservation as jest.Mock).mockResolvedValue(expected);

    const res = createRes();
    await reservationController.createReservation(req, res as any);

    expect(reservationService.createReservation).toHaveBeenCalledWith({
      id_document: '123',
      type: 'trip',
      id_trip: 1,
      license_plate: undefined,
      total_amount: 100,
      date_reservacion: '2025-10-27',
      final_date: undefined,
      payment_method: 'card',
      transaction_code: 'abc',
      currency: 'USD',
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expected);
  });

  test('createReservation maneja 400', async () => {
    (reservationService.createReservation as jest.Mock).mockRejectedValue(new Error('x'));
    const req = { body: {} } as unknown as Request;
    const res = createRes();
    await reservationController.createReservation(req, res as any);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('updateReservationDates retorna 200', async () => {
    const req = { params: { id: '1' }, body: { new_date_reservacion: '2025-10-28', new_final_date: '2025-10-29' } } as unknown as Request;
    const res = createRes();
    const updated = { id_reservation: 1, id_document: '123', date_reservacion: '2025-10-28', final_date: '2025-10-29' };

    (reservationService.updateReservationDates as jest.Mock).mockResolvedValue(updated);
    await reservationController.updateReservationDates(req, res as any);
    expect(res.json).toHaveBeenCalledWith(updated);
  });

  test('updateReservationDates maneja 400', async () => {
    (reservationService.updateReservationDates as jest.Mock).mockRejectedValue(new Error('x'));
    const req = { params: { id: '1' }, body: {} } as unknown as Request;
    const res = createRes();
    await reservationController.updateReservationDates(req, res as any);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('cancelReservation retorna 200', async () => {
    const req = { params: { id: '1' } } as unknown as Request;
    const res = createRes();
    const cancelled = { id_reservation: 1, is_active: false };
    (reservationService.cancelReservation as jest.Mock).mockResolvedValue(cancelled);
    await reservationController.cancelReservation(req, res as any);
    expect(res.json).toHaveBeenCalledWith(cancelled);
  });

  test('cancelReservation maneja 400', async () => {
    (reservationService.cancelReservation as jest.Mock).mockRejectedValue(new Error('x'));
    const req = { params: { id: '1' } } as unknown as Request;
    const res = createRes();
    await reservationController.cancelReservation(req, res as any);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('getReservationWithoutReview retorna 200 con lista', async () => {
    const req = { params: { id_document: '123' } } as unknown as Request;
    const res = createRes();
    const data = [{ id_reservation: 1 }];
    (reservationService.getReservationWithoutReview as jest.Mock).mockResolvedValue(data);
    await reservationController.getReservationWithoutReview(req, res as any);
    expect(res.json).toHaveBeenCalledWith(data);
  });

  test('getReservationWithoutReview maneja 400 si no id_document', async () => {
    const req = { params: {} } as unknown as Request;
    const res = createRes();
    await reservationController.getReservationWithoutReview(req, res as any);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('getReservationWithoutReview maneja 500', async () => {
    const req = { params: { id_document: '123' } } as unknown as Request;
    const res = createRes();
    (reservationService.getReservationWithoutReview as jest.Mock).mockRejectedValue(new Error('x'));
    await reservationController.getReservationWithoutReview(req, res as any);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  test('getReservationById retorna 200', async () => {
    const req = { params: { id: '1' } } as unknown as Request;
    const res = createRes();
    const data = { id_reservation: 1 };
    (reservationService.getReservationById as jest.Mock).mockResolvedValue(data);
    await reservationController.getReservationById(req, res as any);
    expect(res.json).toHaveBeenCalledWith(data);
  });

  test('getReservationById maneja 404 si no existe', async () => {
    const req = { params: { id: '1' } } as unknown as Request;
    const res = createRes();
    (reservationService.getReservationById as jest.Mock).mockResolvedValue(null);
    await reservationController.getReservationById(req, res as any);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('getReservationById maneja 500', async () => {
    const req = { params: { id: '1' } } as unknown as Request;
    const res = createRes();
    (reservationService.getReservationById as jest.Mock).mockRejectedValue(new Error('x'));
    await reservationController.getReservationById(req, res as any);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});
