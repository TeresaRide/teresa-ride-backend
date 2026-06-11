jest.mock('../../config/db');

import db from '../../config/db';
import * as reviewService from '../../services/review.service';
import { Review } from '../../models/review.model';

const queryMock = (db as unknown as { query: jest.Mock }).query;

describe('review.service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('getAllReviews retorna lista', async () => {
        const rows: Review[] = [
            { id_review: '1', id_reservation: 'R1', comment: 'ok', rating: 5, date_review: new Date(), type: 'Vehicle' },
        ];
        queryMock.mockImplementation((sql: string, cb: Function) => cb(null, rows));
        const res = await reviewService.getAllReviews();
        expect(queryMock).toHaveBeenCalledWith('SELECT * FROM `Review`', expect.any(Function));
        expect(res).toEqual(rows);
    });

    test('getAllReviews lanza error si falla la base de datos', async () => {
        const error = new Error('SQL syntax error');
        queryMock.mockImplementation((sql: string, cb: Function) => cb(error));

        await expect(reviewService.getAllReviews()).rejects.toThrow('SQL syntax error');
    });

    test('getReviewById retorna 1 registro', async () => {
        const row: any = { id_review: '9', id_reservation: 'R2', comment: 'c', rating: 4, date_review: new Date(), type: 'Trip' };
        queryMock.mockImplementation((sql: string, params: any[], cb: Function) => cb(null, [row]));
        const res = await reviewService.getReviewById('9');
        expect(queryMock).toHaveBeenCalledWith('SELECT * FROM `Review` WHERE id_review = ?', ['9'], expect.any(Function));
        expect(res).toEqual(row);
    });

    test('getReviewById rechaza si no existe', async () => {
        queryMock.mockImplementation((sql: string, params: any[], cb: Function) => cb(null, []));
        await expect(reviewService.getReviewById('X')).rejects.toThrow('Review not found');
    });

    test('createReview inserta y setea insertId si aplica', async () => {
        const payload: any = { id_reservation: 'R', comment: 'c', rating: 3, date_review: new Date(), type: 'Vehicle' };
        queryMock.mockImplementation((sql: string, params: any[], cb: Function) => cb(null, { insertId: 77 }));
        const res = await reviewService.createReview(payload as Review);
        expect(res.id_review).toBe(77 as any);
    });

    test('createReview lanza error si rating es inválido', async () => {
        const payload: Review = { id_review: '1', id_reservation: 'R5', comment: 'bad rating', rating: 8, date_review: new Date(), type: 'Vehicle' };
        await expect(reviewService.createReview(payload))
            .rejects.toThrow('rating must be between 1 and 5');
    });

    test('updateReview retorna actualizado', async () => {
        const spyGet = jest.spyOn(reviewService, 'getReviewById').mockResolvedValue({
            id_review: '2',
            id_reservation: 'R3',
            comment: 'new',
            rating: 5,
            date_review: new Date(),
            type: 'Trip',
        } as Review);
        queryMock.mockImplementation((sql: string, params: any[], cb: Function) => cb(null, { affectedRows: 1 }));
        const res = await reviewService.updateReview('2', { comment: 'new' });
        expect(spyGet).toHaveBeenCalledWith('2');
        expect(res.comment).toBe('new');
    });

    test('updateReview rechaza si no existe', async () => {
        queryMock.mockImplementation((sql: string, params: any[], cb: Function) => cb(null, { affectedRows: 0 }));
        await expect(reviewService.updateReview('2', { comment: 'new' })).rejects.toThrow('Review not found');
    });

    test('deleteReview resuelve cuando affectedRows > 0', async () => {
        queryMock.mockImplementation((sql: string, params: any[], cb: Function) => cb(null, { affectedRows: 1 }));
        await expect(reviewService.deleteReview('2')).resolves.toBeUndefined();
    });

    test('deleteReview rechaza cuando affectedRows = 0', async () => {
        queryMock.mockImplementation((sql: string, params: any[], cb: Function) => cb(null, { affectedRows: 0 }));
        await expect(reviewService.deleteReview('2')).rejects.toThrow('Review not found');
    });
});