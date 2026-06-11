import { rejects } from 'assert';
import db from '../config/db';
import { Review } from '../models/review.model';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export const getAllReviews = (): Promise<Review[]> => {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM `Review`', (err, results) => {
      if (err) return reject(err);
      resolve(results as Review[]);
    });
  });
};

export const getReviewById = (id: string): Promise<Review> => {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM `Review` WHERE id_review = ?', [id], (err, results) => {
      if (err) return reject(err);
      const rows = results as RowDataPacket[];
      if (!Array.isArray(rows) || rows.length === 0) return reject(new Error('Review not found'));
      resolve(rows[0] as unknown as Review);
    });
  });
};

export const createReview = (review: Review): Promise<Review> => {
  return new Promise((resolve, reject) => {
    if (review.rating == null || review.rating < 1 || review.rating > 5)
      throw new Error('rating must be between 1 and 5');
    db.query('INSERT INTO `Review` SET ?', [review], (err, result: ResultSetHeader) => {
      if (err) return reject(err);
      if (result?.insertId && (review as any).id_review === undefined) {
        (review as any).id_review = result.insertId;
      }
      resolve(review);
    });
  });
};

export const updateReview = (id: string, data: Partial<Review>): Promise<Review> => {
  return new Promise((resolve, reject) => {
    db.query('UPDATE `Review` SET ? WHERE id_review = ?', [data, id], (err, result: ResultSetHeader) => {
      if (err) return reject(err);
      if (!result || result.affectedRows === 0) return reject(new Error('Review not found'));
      getReviewById(id).then(resolve).catch(reject);
    });
  });
};

export const deleteReview = (id: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.query('DELETE FROM `Review` WHERE id_review = ?', [id], (err, result: ResultSetHeader) => {
      if (err) return reject(err);
      if (!result || result.affectedRows === 0) return reject(new Error('Review not found'));
      resolve();
    });
  });
};