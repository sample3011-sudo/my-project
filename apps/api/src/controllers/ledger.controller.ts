import { Request, Response, NextFunction } from 'express';
import { ledgerService } from '../services/ledger.service';
import { LedgerFilters } from '@repo/shared';

export class LedgerController {
  getTransactions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const rawCategories = (req.query.categories ?? req.query['categories[]']) as unknown;
      let categories: any = undefined;
      if (rawCategories) {
        if (Array.isArray(rawCategories)) {
          categories = rawCategories;
        } else if (typeof rawCategories === 'string') {
          categories = rawCategories.includes(',')
            ? rawCategories.split(',').map((s) => s.trim())
            : [rawCategories.trim()];
        }
      }

      const rawMerchants = (req.query.merchants ?? req.query['merchants[]']) as unknown;
      let merchants: string[] | undefined = undefined;
      if (rawMerchants) {
        if (Array.isArray(rawMerchants)) {
          merchants = rawMerchants as string[];
        } else if (typeof rawMerchants === 'string') {
          merchants = rawMerchants.includes(',')
            ? rawMerchants.split(',').map((s) => s.trim())
            : [rawMerchants.trim()];
        }
      }

      const filters: LedgerFilters = {
        search: req.query.search as string | undefined,
        dateFrom: req.query.dateFrom as string | undefined,
        dateTo: req.query.dateTo as string | undefined,
        categories,
        merchants,
        amountMin: req.query.amountMin ? parseFloat(req.query.amountMin as string) : undefined,
        amountMax: req.query.amountMax ? parseFloat(req.query.amountMax as string) : undefined,
        txnType: (req.query.txnType as any) || 'both',
        importId: req.query.importId as string | undefined,
        page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
        pageSize: req.query.pageSize ? parseInt(req.query.pageSize as string, 10) : 50,
      };

      const result = await ledgerService.getTransactions(req.user!.userId, filters);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getTransaction = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await ledgerService.getTransaction(req.user!.userId, req.params.id!);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  updateTransaction = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await ledgerService.updateTransaction(
        req.user!.userId,
        req.params.id!,
        req.body
      );
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}

export const ledgerController = new LedgerController();
