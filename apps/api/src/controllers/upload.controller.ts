import { Request, Response, NextFunction } from 'express';
import { uploadService } from '../services/upload.service';
import { ValidationError } from '../errors';

export class UploadController {
  uploadFile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.file) {
        throw new ValidationError('The selected file appears to be empty.', 'UPLOAD_EMPTY_FILE');
      }

      const result = await uploadService.createSession(
        req.user!.userId,
        req.file.buffer,
        req.file.originalname,
        req.body.bankName
      );

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getPreview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await uploadService.getPreview(req.user!.userId, req.params.id!);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  saveMapping = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await uploadService.saveMapping(
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

  getBankPresets = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const bankName = req.query.bankName as string | undefined;
      const result = await uploadService.getBankPresets(req.user!.userId, bankName);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  saveBankPreset = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await uploadService.saveBankPreset(req.user!.userId, req.body);
      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  parseSession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await uploadService.parseSession(req.user!.userId, req.params.id!);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  updateMalformed = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await uploadService.updateMalformedRows(
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

  commitSession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await uploadService.commitSession(req.user!.userId, req.params.id!);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getImports = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const pageSize = parseInt(req.query.pageSize as string, 10) || 50;
      const result = await uploadService.getImports(req.user!.userId, page, pageSize);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getImportDetail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await uploadService.getImportDetail(req.user!.userId, req.params.id!);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  rollbackImport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await uploadService.rollbackImport(req.user!.userId, req.params.id!);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}

export const uploadController = new UploadController();
