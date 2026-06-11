import { Request, Response } from 'express';
import { Review } from '../models/review.model';
import * as reviewService from '../services/review.service';

export const getAll = async (_req: Request, res: Response) => {
  try {
    const reviews = await reviewService.getAllReviews();
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving reviews', error });
  }
};

export const getById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const review = await reviewService.getReviewById(id);
    res.json(review);
  } catch (error) {
    res.status(404).json({ message: 'Review not found', error });
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    const payload = req.body as any;

    if (payload.rating !== undefined) payload.rating = Number(payload.rating);

    const newReview: Review = payload as Review;
    const review = await reviewService.createReview(newReview);
    res.status(201).json(review);
  } catch (error) {
    res.status(400).json({ message: 'Error creating review', error });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const payload = req.body as any;

    if (payload.rating !== undefined) payload.rating = Number(payload.rating);

    const updateData: Partial<Review> = payload as Partial<Review>;
    const review = await reviewService.updateReview(id, updateData);
    res.json(review);
  } catch (error) {
    res.status(404).json({ message: 'Review not found or error updating', error });
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await reviewService.deleteReview(id);
    res.status(204).send();
  } catch (error) {
    res.status(404).json({ message: 'Review not found or error deleting', error });
  }
};