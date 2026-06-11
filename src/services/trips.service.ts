import db from '../config/db';
import { Trip } from '../models/trip.model';

export const getAllTrips = (): Promise<Trip[]> => {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM Trip', (err, results) => {
      if (err) reject(err);
      else resolve(results as Trip[]);
    });
  });
};

export const getTripById = (id: string): Promise<Trip> => {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM Trip WHERE id_trip = ?', [id], (err, results) => {
      if (err) reject(err);
      else {
        const trips = results as Trip[];
        if (!Array.isArray(trips) || trips.length === 0)
          reject(new Error('Trip not found'));
        else resolve(trips[0]);
      }
    });
  });
};

export const createTrip = (trip: Trip): Promise<Trip> => {
  return new Promise((resolve, reject) => {
    db.query('INSERT INTO Trip SET ?', trip, (err, result) => {
      if (err) reject(err);
      else {
        const insertId = (result as any).insertId;
        getTripById(insertId)
          .then(resolve)
          .catch(reject);
      }
    });
  });
};

export const updateTrip = (id: string, trip: Partial<Trip>): Promise<Trip> => {
  return new Promise((resolve, reject) => {
    db.query('UPDATE Trip SET ? WHERE id_trip = ?', [trip, id], (err, result) => {
      if (err) reject(err);
      else if ((result as any).affectedRows === 0)
        reject(new Error('Trip not found'));
      else {
        getTripById(id)
          .then(resolve)
          .catch(reject);
      }
    });
  });
};

export const deleteTrip = (id: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.query('DELETE FROM Trip WHERE id_trip = ?', [id], (err, result) => {
      if (err) reject(err);
      else if ((result as any).affectedRows === 0)
        reject(new Error('Trip not found'));
      else resolve();
    });
  });
};
