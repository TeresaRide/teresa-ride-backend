import db from '../config/db';
import { Reservation } from '../models/reservation.model';
import { RowDataPacket } from 'mysql2';

export const getUserReservations = (id_document: string): Promise<Reservation[]> => {
 

  return new Promise((resolve, reject) => {
    db.query('CALL sp_get_user_reservations(?)', [id_document], (err, results: any) => {
      if (err) {
      
        return reject(err);
      }
    
      const reservations: Reservation[] = Array.isArray(results[0]) ? results[0] : [];
     

      resolve(reservations);
    });
  });
};

export const createReservation = (reservationData: {
  id_document: string;
  type: 'vehicle' | 'trip';
  id_trip?: number;
  license_plate?: string;
  total_amount: number;
  date_reservacion: string;
  final_date?: string;
  payment_method: string;
  transaction_code: string;
  currency: string;
}): Promise<{ new_reservation_id: number; total_amount: number }> => {
  const {
    id_document,
    type,
    id_trip = null,
    license_plate = null,
    total_amount,
    date_reservacion,
    final_date = null,
    payment_method,
    transaction_code,
    currency,
  } = reservationData;

  return new Promise((resolve, reject) => {
    db.query(
      'CALL sp_create_reservation(?,?,?,?,?,?,?,?,?,?)',
      [
        id_document,
        type,             
        id_trip,
        license_plate,
        total_amount,     
        date_reservacion,
        final_date,
        payment_method,
        transaction_code,
        currency,
      ],
      (err, results: any) => {
        if (err) reject(err);
        else resolve(results[0][0]);
      }
    );
  });
};


export const updateReservationDates = (id_reservation: number, newDates: {
new_date_reservacion: string;
new_final_date?: string;
}): Promise<{ updated_reservation_id: number; reservation_type: 'trip' | 'vehicle'; new_start_date: string; new_end_date?: string }> => {
  const { new_date_reservacion, new_final_date } = newDates;

  return new Promise((resolve, reject) => {
    db.query(
      'CALL sp_update_reservation_dates(?,?,?)',
      [id_reservation, new_date_reservacion, new_final_date || null],
      (err, results: any) => {
        if (err) reject(err);
        else resolve(results[0][0]);
      }
    );
  });
};

export const cancelReservation = (id_reservation: number): Promise<{ cancelled_reservation_id: number; message: string }> => {
  return new Promise((resolve, reject) => {
    db.query('CALL sp_cancel_reservation(?)', [id_reservation], (err, results: any) => {
      if (err) reject(err);
      else resolve(results[0]);
    });
  });
};

export const getReservationWithoutReview = (id_document: string): Promise<Reservation | null> => {
  return new Promise((resolve, reject) => {
    db.query('CALL sp_get_reservation_without_review(?)', [id_document], (err, results: any) => {
      if (err) {
        console.error('getReservationWithoutReview error:', err);
        return reject(err);
      }
      const rows = Array.isArray(results?.[0]) ? results[0] : [];
      resolve(rows.length > 0 ? (rows[0] as Reservation) : null);
    });
  });
};

export const getReservationById = (id_reservation: number): Promise<Reservation | null> => {
  return new Promise((resolve, reject) => {
    db.query<RowDataPacket[]>(
      'SELECT * FROM `Reservation` WHERE id_reservation = ? LIMIT 1',
      [id_reservation],
      (err, rows) => {
        if (err) {
          console.error('getReservationById error:', err);
          return reject(err);
        }
        resolve(rows.length > 0 ? (rows[0] as unknown as Reservation) : null);
      }
    );
  });
};
