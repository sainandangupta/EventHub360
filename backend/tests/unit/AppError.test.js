const AppError = require('../../utils/AppError');

describe('AppError', () => {
  test('creates error with status code', () => {
    const err = new AppError('Not found', 404);
    expect(err.message).toBe('Not found');
    expect(err.statusCode).toBe(404);
    expect(err.isOperational).toBe(true);
  });

  test('static helpers return correct status codes', () => {
    expect(AppError.unauthorized().statusCode).toBe(401);
    expect(AppError.forbidden().statusCode).toBe(403);
    expect(AppError.notFound().statusCode).toBe(404);
    expect(AppError.validation().statusCode).toBe(422);
    expect(AppError.internal().statusCode).toBe(500);
  });
});
