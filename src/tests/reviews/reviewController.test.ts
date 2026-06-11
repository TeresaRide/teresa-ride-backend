import { Request, Response } from 'express';
import * as reviewController from '../../controllers/review.controller';
import * as reviewService from '../../services/review.service';

jest.mock('../../services/review.service', () => ({
  __esModule: true,
  getAllReviews: jest.fn(),
  getReviewById: jest.fn(),
  createReview: jest.fn(),
  updateReview: jest.fn(),
  deleteReview: jest.fn(),
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

describe('review.controller', () => {
  beforeEach(() => jest.clearAllMocks());

  test('getAll retorna 200 con lista', async () => {
    (reviewService.getAllReviews as jest.Mock).mockResolvedValue([{ id_review: '1' }]);
    const res = createRes();
    await reviewController.getAll({} as Request, res as any);
    expect(res.json).toHaveBeenCalledWith([{ id_review: '1' }]);
  });

  test('getAll maneja 500', async () => {
    (reviewService.getAllReviews as jest.Mock).mockRejectedValue(new Error('x'));
    const res = createRes();
    await reviewController.getAll({} as Request, res as any);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  test('getById retorna 200', async () => {
    (reviewService.getReviewById as jest.Mock).mockResolvedValue({ id_review: '9' });
    const res = createRes();
    await reviewController.getById({ params: { id: '9' } } as any, res as any);
    expect(res.json).toHaveBeenCalledWith({ id_review: '9' });
  });

  test('getById maneja 404', async () => {
    (reviewService.getReviewById as jest.Mock).mockRejectedValue(new Error('no'));
    const res = createRes();
    await reviewController.getById({ params: { id: 'x' } } as any, res as any);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('create convierte rating y retorna 201', async () => {
    (reviewService.createReview as jest.Mock).mockImplementation(async (r: any) => r);
    const res = createRes();
    await reviewController.create({ body: { rating: '5' } } as any, res as any);
    expect(reviewService.createReview).toHaveBeenCalledWith(expect.objectContaining({ rating: 5 }));
    expect(res.status).toHaveBeenCalledWith(201);
  });

  test('create maneja 400', async () => {
    (reviewService.createReview as jest.Mock).mockRejectedValue(new Error('bad'));
    const res = createRes();
    await reviewController.create({ body: {} } as any, res as any);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('update convierte rating y retorna 200', async () => {
    (reviewService.updateReview as jest.Mock).mockResolvedValue({ id_review: '2', rating: 4 });
    const res = createRes();
    await reviewController.update({ params: { id: '2' }, body: { rating: '4' } } as any, res as any);
    expect(reviewService.updateReview).toHaveBeenCalledWith('2', expect.objectContaining({ rating: 4 }));
    expect(res.json).toHaveBeenCalledWith({ id_review: '2', rating: 4 });
  });

  test('update maneja 404', async () => {
    (reviewService.updateReview as jest.Mock).mockRejectedValue(new Error('no'));
    const res = createRes();
    await reviewController.update({ params: { id: '2' }, body: {} } as any, res as any);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('remove retorna 204', async () => {
    (reviewService.deleteReview as jest.Mock).mockResolvedValue(undefined);
    const res = createRes();
    await reviewController.remove({ params: { id: '3' } } as any, res as any);
    expect(reviewService.deleteReview).toHaveBeenCalledWith('3');
    expect(res.status).toHaveBeenCalledWith(204);
  });

  test('remove maneja 404', async () => {
    (reviewService.deleteReview as jest.Mock).mockRejectedValue(new Error('no'));
    const res = createRes();
    await reviewController.remove({ params: { id: '3' } } as any, res as any);
    expect(res.status).toHaveBeenCalledWith(404);
  });
});