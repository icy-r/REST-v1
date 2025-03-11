const mongoose = require('mongoose');
const Report = require('../models/Report');
const Transaction = require('../models/Transaction');
const reportController = require('../controllers/reportController');

describe('Report Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: { id: 'userId' },
      body: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  describe("generateReport", () => {
    it("should generate a report", async () => {
      req.body = {
        reportType: "spending-by-category",
        startDate: "2023-01-01",
        endDate: "2023-01-31",
        filters: {},
      };

      Transaction.find = jest.fn().mockResolvedValue([
        { type: "expense", category: "Food", amount: 100 },
        { type: "expense", category: "Transport", amount: 50 },
      ]);

      const saveMock = jest.fn();
      Report.prototype.save = saveMock;

      await reportController.generateReport(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        report: expect.any(Object),
      });
      expect(saveMock).toHaveBeenCalled();
    });

    it("should handle errors", async () => {
      req.body = {
        reportType: "spending-by-category",
        startDate: "2023-01-01",
        endDate: "2023-01-31",
        filters: {},
      };

      Transaction.find = jest.fn().mockRejectedValue(new Error("Error"));

      await reportController.generateReport(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Error generating report",
        error: "Error",
      });
    });
  });

  describe("getReportById", () => {
    it("should get a report by ID", async () => {
      req.params = { id: "reportId" };

      Report.findById = jest.fn().mockResolvedValue({
        userId: "userId",
        reportType: "spending-by-category",
        data: {},
      });

      await reportController.getReportById(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        report: expect.any(Object),
      });
    });

    it("should handle report not found", async () => {
      req.params = { id: "reportId" };

      Report.findById = jest.fn().mockResolvedValue(null);

      await reportController.getReportById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Report not found",
      });
    });

    it("should handle unauthorized access", async () => {
      req.params = { id: "reportId" };

      Report.findById = jest.fn().mockResolvedValue({
        userId: "anotherUserId",
        reportType: "spending-by-category",
        data: {},
      });

      await reportController.getReportById(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Unauthorized to access this report",
      });
    });

    it("should handle errors", async () => {
      req.params = { id: "reportId" };

      Report.findById = jest.fn().mockRejectedValue(new Error("Error"));

      await reportController.getReportById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Error retrieving report",
        error: "Error",
      });
    });
  });

  describe("getUserReports", () => {
    it("should get all reports for a user", async () => {
      req.params = { userId: "userId" };

      const mockSortFunction = jest
        .fn()
        .mockResolvedValue([
          { userId: "userId", reportType: "spending-by-category", data: {} },
        ]);

      Report.find = jest.fn().mockReturnValue({
        sort: mockSortFunction,
      });

      await reportController.getUserReports(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 1,
        reports: expect.any(Array),
      });
    });

    it("should handle errors", async () => {
      req.params = { userId: "userId" };

      Report.find = jest.fn().mockReturnValue({
        sort: jest
          .fn()
          .mockRejectedValue(
            new Error("Report.find(...).sort is not a function")
          ),
      });

      await reportController.getUserReports(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Error retrieving reports",
        error: "Report.find(...).sort is not a function",
      });
    });
  });

  describe('deleteReport', () => {
    it('should delete a report', async () => {
      req.params = { id: 'reportId' };

      Report.findById = jest.fn().mockResolvedValue({
        userId: 'userId',
        remove: jest.fn()
      });

      await reportController.deleteReport(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Report deleted successfully'
      });
    });

    it('should handle report not found', async () => {
      req.params = { id: 'reportId' };

      Report.findById = jest.fn().mockResolvedValue(null);

      await reportController.deleteReport(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Report not found'
      });
    });

    it('should handle unauthorized access', async () => {
      req.params = { id: 'reportId' };

      Report.findById = jest.fn().mockResolvedValue({
        userId: 'anotherUserId',
        remove: jest.fn()
      });

      await reportController.deleteReport(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Unauthorized to delete this report'
      });
    });

    it('should handle errors', async () => {
      req.params = { id: 'reportId' };

      Report.findById = jest.fn().mockRejectedValue(new Error('Error'));

      await reportController.deleteReport(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Error deleting report',
        error: 'Error'
      });
    });
  });
});
