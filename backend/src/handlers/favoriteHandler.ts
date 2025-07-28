import express, { Request, Response } from 'express';
import { verifyAuthToken } from '../helpers/verifyAuthToken';
import { FavoriteModel } from '../models/favorite';
import { AuthRequest } from '../types/types';

const favoriteModel = new FavoriteModel();

// GET /favorites - Get all favorites for the current user
const index = async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;

    if (!authReq.user || !authReq.user.user_id) {
      return res.status(401).json({ message: 'Not authenticated.' });
    }

    const userId = authReq.user.user_id;
    const favorites = await favoriteModel.getByUserId(userId);
    res.status(200).json(favorites);
  } catch (error) {
    console.error('Error in index (get favorites):', error);
    res.status(500).json({ message: 'Error getting user favorites' });
  }
};

// POST /favorites/:siteId - Add a site to favorites
const create = async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;

    if (!authReq.user || !authReq.user.user_id) {
      return res.status(401).json({ message: 'Not authenticated.' });
    }

    const userId = authReq.user.user_id;
    const siteId = parseInt(req.params.siteId);

    const exists = await favoriteModel.exists(userId, siteId);
    if (exists) {
      return res.status(409).json({ message: 'Site is already in favorites' });
    }

    const favorite = await favoriteModel.create({
      user_id: userId,
      site_id: siteId
    });
    res.status(201).json(favorite);
  } catch (error) {
    console.error('Error in create (add favorite):', error);
    res.status(500).json({ message: 'Error adding favorite' });
  }
};

// DELETE /favorites/:siteId - Remove a site from favorites
const destroy = async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;

    if (!authReq.user || !authReq.user.user_id) {
      return res.status(401).json({ message: 'Not authenticated.' });
    }

    const userId = authReq.user.user_id;
    const siteId = parseInt(req.params.siteId);

    const success = await favoriteModel.delete(userId, siteId);
    if (success) {
      res.status(200).json({ message: 'Favorite removed successfully' });
    } else {
      res.status(404).json({ message: 'Favorite not found' });
    }
  } catch (error) {
    console.error('Error in destroy (remove favorite):', error);
    res.status(500).json({ message: 'Error removing favorite' });
  }
};

// GET /favorites/:siteId/check - Check if site is in favorites
const check = async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;

    if (!authReq.user || !authReq.user.user_id) {
      return res.status(401).json({ message: 'Not authenticated.' });
    }

    const userId = authReq.user.user_id;
    const siteId = parseInt(req.params.siteId);

    const isFavorited = await favoriteModel.exists(userId, siteId);
    res.status(200).json({ is_favorited: isFavorited });
  } catch (error) {
    console.error('Error in check (check favorite):', error);
    res.status(500).json({ message: 'Error checking favorite status' });
  }
};

// Register all favorite routes in one function
const favoriteRoutes = (app: express.Application) => {
  app.use('/favorites', verifyAuthToken);

  app.get('/favorites', index);
  app.post('/favorites/:siteId', create);
  app.delete('/favorites/:siteId', destroy);
  app.get('/favorites/:siteId/check', check);
};

export { favoriteRoutes };
