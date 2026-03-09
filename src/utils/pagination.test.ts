import {
  validatePaginationParams,
  calculatePaginationMetadata,
  paginateResults,
} from './pagination';

describe('Pagination Utils', () => {
  describe('validatePaginationParams', () => {
    it('should use default values when no parameters provided', () => {
      const result = validatePaginationParams();
      expect(result).toEqual({
        page: 1,
        limit: 10,
        skip: 0,
      });
    });

    it('should validate page >= 1', () => {
      const result = validatePaginationParams(-5, 10);
      expect(result.page).toBe(1);
      expect(result.skip).toBe(0);
    });

    it('should validate limit between 1 and 100', () => {
      const result1 = validatePaginationParams(1, 0);
      expect(result1.limit).toBe(1);

      const result2 = validatePaginationParams(1, 200);
      expect(result2.limit).toBe(100);
    });

    it('should calculate skip correctly', () => {
      const result = validatePaginationParams(3, 20);
      expect(result.skip).toBe(40); // (3-1) * 20
    });

    it('should handle edge cases', () => {
      const result = validatePaginationParams(1, 100);
      expect(result).toEqual({
        page: 1,
        limit: 100,
        skip: 0,
      });
    });
  });

  describe('calculatePaginationMetadata', () => {
    it('should calculate metadata correctly for first page', () => {
      const metadata = calculatePaginationMetadata(100, 1, 10);
      expect(metadata).toEqual({
        total: 100,
        page: 1,
        limit: 10,
        totalPages: 10,
        hasNextPage: true,
        hasPrevPage: false,
      });
    });

    it('should calculate metadata correctly for middle page', () => {
      const metadata = calculatePaginationMetadata(100, 5, 10);
      expect(metadata).toEqual({
        total: 100,
        page: 5,
        limit: 10,
        totalPages: 10,
        hasNextPage: true,
        hasPrevPage: true,
      });
    });

    it('should calculate metadata correctly for last page', () => {
      const metadata = calculatePaginationMetadata(100, 10, 10);
      expect(metadata).toEqual({
        total: 100,
        page: 10,
        limit: 10,
        totalPages: 10,
        hasNextPage: false,
        hasPrevPage: true,
      });
    });

    it('should handle non-exact division', () => {
      const metadata = calculatePaginationMetadata(95, 1, 10);
      expect(metadata.totalPages).toBe(10); // ceil(95/10) = 10
    });

    it('should handle empty results', () => {
      const metadata = calculatePaginationMetadata(0, 1, 10);
      expect(metadata).toEqual({
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false,
      });
    });
  });

  describe('paginateResults', () => {
    it('should paginate results correctly', async () => {
      // Mock data
      const mockData = Array.from({ length: 100 }, (_, i) => ({
        id: i + 1,
        name: `Item ${i + 1}`,
      }));

      // Mock query function
      const queryFn = jest.fn(async (skip: number, limit: number) => {
        return mockData.slice(skip, skip + limit);
      });

      // Mock count function
      const countFn = jest.fn(async () => mockData.length);

      // Execute pagination
      const result = await paginateResults(queryFn, countFn, {
        page: 2,
        limit: 10,
      });

      // Verify query was called with correct parameters
      expect(queryFn).toHaveBeenCalledWith(10, 10); // skip=10, limit=10
      expect(countFn).toHaveBeenCalled();

      // Verify result
      expect(result.data).toHaveLength(10);
      expect(result.data[0].id).toBe(11); // First item of page 2
      expect(result.metadata).toEqual({
        total: 100,
        page: 2,
        limit: 10,
        totalPages: 10,
        hasNextPage: true,
        hasPrevPage: true,
      });
    });

    it('should handle invalid page and limit', async () => {
      const mockData = [{ id: 1 }, { id: 2 }];
      const queryFn = jest.fn(async () => mockData);
      const countFn = jest.fn(async () => 2);

      const result = await paginateResults(queryFn, countFn, {
        page: -1,
        limit: 200,
      });

      // Should normalize to page=1, limit=100
      expect(queryFn).toHaveBeenCalledWith(0, 100);
      expect(result.metadata.page).toBe(1);
      expect(result.metadata.limit).toBe(100);
    });

    it('should use default values when options not provided', async () => {
      const mockData = [{ id: 1 }];
      const queryFn = jest.fn(async () => mockData);
      const countFn = jest.fn(async () => 1);

      const result = await paginateResults(queryFn, countFn);

      expect(queryFn).toHaveBeenCalledWith(0, 10); // default page=1, limit=10
      expect(result.metadata.page).toBe(1);
      expect(result.metadata.limit).toBe(10);
    });

    it('should execute query and count in parallel', async () => {
      const executionOrder: string[] = [];

      const queryFn = jest.fn(async () => {
        executionOrder.push('query-start');
        await new Promise((resolve) => setTimeout(resolve, 10));
        executionOrder.push('query-end');
        return [];
      });

      const countFn = jest.fn(async () => {
        executionOrder.push('count-start');
        await new Promise((resolve) => setTimeout(resolve, 10));
        executionOrder.push('count-end');
        return 0;
      });

      await paginateResults(queryFn, countFn);

      // Both should start before either ends (parallel execution)
      const queryStartIndex = executionOrder.indexOf('query-start');
      const countStartIndex = executionOrder.indexOf('count-start');
      const queryEndIndex = executionOrder.indexOf('query-end');
      const countEndIndex = executionOrder.indexOf('count-end');

      expect(queryStartIndex).toBeLessThan(queryEndIndex);
      expect(countStartIndex).toBeLessThan(countEndIndex);
    });
  });
});
