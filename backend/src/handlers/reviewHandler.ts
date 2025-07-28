import express, { Request, Response } from 'express';
import { verifyAuthToken } from '../helpers/verifyAuthToken';
import reviewModel from '../models/review';
import { AuthRequest } from '../types/types';

// GET /reviews/site/:siteId - public
const getSiteReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const siteId = parseInt(req.params.siteId);
    const reviews = await reviewModel.getBySiteId(siteId);
    res.status(200).json(reviews);
  } catch (error) {
    console.error('Error in getSiteReviews:', error);
    res.status(500).json({ message: 'Error getting site reviews' });
  }
};

// POST /reviews/site/:siteId - protected
const createReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    if (!authReq.user || !authReq.user.user_id) {
      res.status(401).json({ message: 'Not authenticated.' });
      return;
    }

    const userId = authReq.user.user_id;
    const siteId = parseInt(req.params.siteId);
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      res.status(400).json({ message: 'Rating must be between 1 and 5.' });
      return;
    }

    const existingReviewId = await reviewModel.getExistingReview(
      userId,
      siteId
    );

    if (existingReviewId) {
      const updatedReview = await reviewModel.update(existingReviewId, userId, {
        rating,
        comment
      });
      if (updatedReview) {
        res.status(200).json(updatedReview);
      } else {
        res
          .status(404)
          .json({ message: 'Review not found or not authorized to update' });
      }
      return;
    }

    const review = await reviewModel.create({
      user_id: userId,
      site_id: siteId,
      rating,
      comment
    });
    res.status(201).json(review);
  } catch (error) {
    console.error('Error in createReview:', error);
    res.status(500).json({ message: 'Error creating review' });
  }
};

// PUT /reviews/:reviewId - protected
const updateReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    if (!authReq.user || !authReq.user.user_id) {
      res.status(401).json({ message: 'Not authenticated.' });
      return;
    }

    const userId = authReq.user.user_id;
    const reviewId = parseInt(req.params.reviewId);
    const { rating, comment } = req.body;

    if (rating !== undefined && (rating < 1 || rating > 5)) {
      res.status(400).json({ message: 'Rating must be between 1 and 5.' });
      return;
    }

    const updatedReview = await reviewModel.update(reviewId, userId, {
      rating,
      comment
    });

    if (updatedReview) {
      res.status(200).json(updatedReview);
    } else {
      res
        .status(404)
        .json({ message: 'Review not found or not authorized to update' });
    }
  } catch (error) {
    console.error('Error in updateReview:', error);
    res.status(500).json({ message: 'Error updating review' });
  }
};

// DELETE /reviews/:reviewId - protected
const deleteReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    if (!authReq.user || !authReq.user.user_id) {
      res.status(401).json({ message: 'Not authenticated.' });
      return;
    }

    const userId = authReq.user.user_id;
    const reviewId = parseInt(req.params.reviewId);

    const success = await reviewModel.delete(reviewId, userId);

    if (success) {
      res.status(200).json({ message: 'Review deleted successfully' });
    } else {
      res
        .status(404)
        .json({ message: 'Review not found or not authorized to delete' });
    }
  } catch (error) {
    console.error('Error in deleteReview:', error);
    res.status(500).json({ message: 'Error deleting review' });
  }
};

// GET /reviews/user - protected
const getUserReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    if (!authReq.user || !authReq.user.user_id) {
      res.status(401).json({ message: 'Not authenticated.' });
      return;
    }

    const userId = authReq.user.user_id;
    const reviews = await reviewModel.getByUserId(userId);
    res.status(200).json(reviews);
  } catch (error) {
    console.error('Error in getUserReviews:', error);
    res.status(500).json({ message: 'Error getting user reviews' });
  }
};

// Register all review routes
const reviewRoutes = (app: express.Application) => {
  // Public route
  app.get('/reviews/site/:siteId', getSiteReviews);

  // Protected routes
  app.use('/reviews', verifyAuthToken);

  app.post('/reviews/site/:siteId', createReview);
  app.put('/reviews/:reviewId', updateReview);
  app.delete('/reviews/:reviewId', deleteReview);
  app.get('/reviews/user', getUserReviews);
};

export { reviewRoutes };
