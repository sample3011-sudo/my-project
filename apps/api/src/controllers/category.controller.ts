import { Request, Response, NextFunction } from 'express';
import { categoryService } from '../services/category.service';
import { CategoryRuleSource } from '@repo/shared';

export class CategoryController {
  getRules = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const source = req.query.source as CategoryRuleSource | undefined;
      const page = parseInt(req.query.page as string, 10) || 1;
      const pageSize = parseInt(req.query.pageSize as string, 10) || 50;

      const result = await categoryService.getCategoryRules(
        req.user!.userId,
        source,
        page,
        pageSize
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  saveRule = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { merchantPattern, category, source } = req.body;
      const result = await categoryService.saveRule(
        req.user!.userId,
        merchantPattern,
        category,
        source
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

export const categoryController = new CategoryController();
