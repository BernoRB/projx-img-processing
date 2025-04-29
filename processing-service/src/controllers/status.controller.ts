// src/controllers/status.controller.ts
import { Router, Request, Response, NextFunction } from 'express';
import { dbService } from '../services/db.service';

const router = Router();

// Get status of a specific image
router.get('/:imageId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { imageId } = req.params;
    
    const image = await dbService.getImage(imageId);
    if (!image) {
      res.status(404).json({ message: 'Image not found' });
      return;
    }
    
    res.status(200).json({
      id: image.id,
      status: image.status,
      originalName: image.originalName,
      processedUrls: image.processedUrls || [],
      createdAt: image.createdAt,
      updatedAt: image.updatedAt
    });
    return;
  } catch (error) {
    return next(error);
  }
});

export const statusController = router;