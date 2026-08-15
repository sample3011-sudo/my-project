import { Request, Response, NextFunction } from 'express';
import { dashboardService } from '../services/dashboard.service';

export class DashboardController {
  getMonths = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await dashboardService.getMonths(req.user!.userId);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getSummary = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const month = (req.query.month as string) || new Date().toISOString().substring(0, 7);
      const result = await dashboardService.getMonthSummary(req.user!.userId, month);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getCategories = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const month = (req.query.month as string) || new Date().toISOString().substring(0, 7);
      const result = await dashboardService.getCategoryBreakdown(req.user!.userId, month);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getMerchants = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const month = (req.query.month as string) || new Date().toISOString().substring(0, 7);
      const result = await dashboardService.getTopMerchants(req.user!.userId, month);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}

export const dashboardController = new DashboardController();
