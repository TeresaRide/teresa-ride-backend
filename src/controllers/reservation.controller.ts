import { Request, Response } from 'express';
import * as reservationService from '../services/resevations.service';
import { Reservation } from '../models/reservation.model';


export const getUserReservations= async (req: Request, res: Response) => {
  try {
    const { id_document } = req.params; 

    const reservations: Reservation[] = await reservationService.getUserReservations(id_document);


    if (!reservations || reservations.length === 0) {
      return res.status(404).json({ message: 'No reservations found for this user' });
    }

    res.json(reservations);
  } catch (error) {
    console.error('Controller: error ->', error);
    res.status(500).json({ message: 'Error retrieving reservations', error });
  }
};



export const createReservation = async (req: Request, res: Response) => {
  try {
    const payload = req.body;
    const reservationPayload = {
      id_document: payload.id_document,
      type: payload.type, 
      id_trip: payload.type === 'trip' ? payload.id_trip : undefined,
      license_plate: payload.type === 'vehicle' ? payload.license_plate : undefined,
      total_amount: payload.total_amount, 
      date_reservacion: payload.date_reservacion,
      final_date: payload.type === 'vehicle' ? payload.final_date : undefined,
      payment_method: payload.payment_method,
      transaction_code: payload.transaction_code,
      currency: payload.currency,
    };

    
    const result = await reservationService.createReservation(reservationPayload);
    

    res.status(201).json(result);
  } catch (error) {

    res.status(400).json({ message: 'Error creating reservation', error });
  }
};


export const updateReservationDates = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const payload = req.body;

    const result = await reservationService.updateReservationDates(Number(id), {
      new_date_reservacion: payload.new_date_reservacion,
      new_final_date: payload.new_final_date,
    });

    res.json(result);
  } catch (error) {
    res.status(400).json({ message: 'Error updating reservation dates', error });
  }
};


export const cancelReservation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await reservationService.cancelReservation(Number(id));

    res.json(result);
  } catch (error) {
    res.status(400).json({ message: 'Error cancelling reservation', error });
  }
};

export const getReservationWithoutReview = async (req: Request, res: Response) => {
  try {
    const { id_document } = req.params;
    if (!id_document) {
      return res.status(400).json({ message: 'id_document is required' });
    }

    const reservations = await reservationService.getReservationWithoutReview(id_document);

    if (!reservations) return res.json([]);
    if (Array.isArray(reservations)) return res.json(reservations);
    return res.json([reservations]);
  } catch (error) {
    console.error('Controller: error ->', error);
    res.status(500).json({ message: 'Error retrieving reservations without review', error });
  }
};

export const getReservationById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const reservation = await reservationService.getReservationById(Number(id));
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }
    res.json(reservation);
  } catch (error) {
    console.error('Controller: error ->', error);
    res.status(500).json({ message: 'Error retrieving reservation', error });
  }
};
