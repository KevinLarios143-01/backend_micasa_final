import { successResponse, errorResponse, paginatedResponse } from '../../src/utils/response';

describe('Response Utilities', () => {
  describe('successResponse', () => {
    it('should create a success response with data', () => {
      const data = { id: 1, name: 'Test' };
      const response = successResponse(data);

      expect(response).toEqual({
        success: true,
        data,
      });
    });

    it('should create a success response with data and message', () => {
      const data = { id: 1, name: 'Test' };
      const message = 'Operation successful';
      const response = successResponse(data, message);

      expect(response).toEqual({
        success: true,
        data,
        message,
      });
    });

    it('should handle null data', () => {
      const response = successResponse(null);

      expect(response).toEqual({
        success: true,
        data: null,
      });
    });

    it('should handle array data', () => {
      const data = [{ id: 1 }, { id: 2 }];
      const response = successResponse(data);

      expect(response).toEqual({
        success: true,
        data,
      });
    });
  });

  describe('errorResponse', () => {
    it('should create an error response with message only', () => {
      const error = 'Something went wrong';
      const response = errorResponse(error);

      expect(response).toEqual({
        success: false,
        error,
      });
    });

    it('should create an error response with details', () => {
      const error = 'Validation failed';
      const details = [
        { field: 'email', message: 'Invalid email format' },
        { field: 'age', message: 'Must be a positive number' },
      ];
      const response = errorResponse(error, details);

      expect(response).toEqual({
        success: false,
        error,
        details,
      });
    });

    it('should create an error response with field', () => {
      const error = 'Duplicate entry';
      const field = 'identificacion';
      const response = errorResponse(error, null, field);

      expect(response).toEqual({
        success: false,
        error,
        field,
      });
    });

    it('should create an error response with multiple fields', () => {
      const error = 'Multiple fields invalid';
      const fields = ['email', 'phone'];
      const response = errorResponse(error, null, fields);

      expect(response).toEqual({
        success: false,
        error,
        field: fields,
      });
    });

    it('should create an error response with details and field', () => {
      const error = 'Constraint violation';
      const details = { constraint: 'unique_email' };
      const field = 'email';
      const response = errorResponse(error, details, field);

      expect(response).toEqual({
        success: false,
        error,
        details,
        field,
      });
    });

    it('should not include details when undefined', () => {
      const error = 'Error message';
      const response = errorResponse(error, undefined);

      expect(response).toEqual({
        success: false,
        error,
      });
      expect(response).not.toHaveProperty('details');
    });
  });

  describe('paginatedResponse', () => {
    it('should create a paginated response with correct metadata', () => {
      const data = [{ id: 1 }, { id: 2 }, { id: 3 }];
      const total = 25;
      const page = 1;
      const limit = 10;

      const response = paginatedResponse(data, total, page, limit);

      expect(response).toEqual({
        success: true,
        data,
        metadata: {
          total: 25,
          page: 1,
          limit: 10,
          totalPages: 3,
          hasNextPage: true,
          hasPrevPage: false,
        },
      });
    });

    it('should calculate totalPages correctly for exact division', () => {
      const data = [{ id: 1 }];
      const total = 20;
      const page = 1;
      const limit = 10;

      const response = paginatedResponse(data, total, page, limit);

      expect(response.metadata.totalPages).toBe(2);
    });

    it('should calculate totalPages correctly with remainder', () => {
      const data = [{ id: 1 }];
      const total = 25;
      const page = 1;
      const limit = 10;

      const response = paginatedResponse(data, total, page, limit);

      expect(response.metadata.totalPages).toBe(3);
    });

    it('should set hasNextPage to false on last page', () => {
      const data = [{ id: 1 }];
      const total = 25;
      const page = 3;
      const limit = 10;

      const response = paginatedResponse(data, total, page, limit);

      expect(response.metadata.hasNextPage).toBe(false);
      expect(response.metadata.hasPrevPage).toBe(true);
    });

    it('should set hasPrevPage to false on first page', () => {
      const data = [{ id: 1 }];
      const total = 25;
      const page = 1;
      const limit = 10;

      const response = paginatedResponse(data, total, page, limit);

      expect(response.metadata.hasNextPage).toBe(true);
      expect(response.metadata.hasPrevPage).toBe(false);
    });

    it('should handle middle page correctly', () => {
      const data = [{ id: 1 }];
      const total = 50;
      const page = 3;
      const limit = 10;

      const response = paginatedResponse(data, total, page, limit);

      expect(response.metadata.hasNextPage).toBe(true);
      expect(response.metadata.hasPrevPage).toBe(true);
    });

    it('should handle empty data array', () => {
      const data: never[] = [];
      const total = 0;
      const page = 1;
      const limit = 10;

      const response = paginatedResponse(data, total, page, limit);

      expect(response).toEqual({
        success: true,
        data: [],
        metadata: {
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: false,
        },
      });
    });

    it('should handle single page of results', () => {
      const data = [{ id: 1 }, { id: 2 }];
      const total = 2;
      const page = 1;
      const limit = 10;

      const response = paginatedResponse(data, total, page, limit);

      expect(response.metadata.totalPages).toBe(1);
      expect(response.metadata.hasNextPage).toBe(false);
      expect(response.metadata.hasPrevPage).toBe(false);
    });

    it('should handle limit of 100 (maximum)', () => {
      const data = Array.from({ length: 100 }, (_, i) => ({ id: i + 1 }));
      const total = 250;
      const page = 2;
      const limit = 100;

      const response = paginatedResponse(data, total, page, limit);

      expect(response.metadata.totalPages).toBe(3);
      expect(response.metadata.hasNextPage).toBe(true);
      expect(response.metadata.hasPrevPage).toBe(true);
    });
  });
});
