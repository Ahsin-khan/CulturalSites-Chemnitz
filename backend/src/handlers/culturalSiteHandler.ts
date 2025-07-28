import express, { Request, Response } from 'express';
import culturalSiteModel from '../models/culturalSite';
import culturalSiteService from '../services/culturalSiteService';
import { ReviewModel } from '../models/review';
import favoriteModel from '../models/favorite';
import categoryModel from '../models/category';
import { AuthRequest } from '../types/types';
import { verifyAuthToken } from '../helpers/verifyAuthToken';

const reviewModel = new ReviewModel();

// ===== Handler Functions =====

const getAllSites = async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string);
    const offset = parseInt(req.query.offset as string) || 0;
    const sites = await culturalSiteModel.getAll(offset);
    res.status(200).json(sites);
  } catch (error) {
    console.error('Error in getAllSites:', error);
    res.status(500).json({ message: 'Error getting cultural sites' });
  }
};

const getSiteById = async (req: Request, res: Response): Promise<void> => {
  try {
    const siteId = parseInt(req.params.id);
    const site = await culturalSiteService.getSiteWithDetails(siteId);

    if (!site) {
      res.status(404).json({ message: 'Cultural site not found' });
      return;
    }

    const reviews = await reviewModel.getBySiteId(siteId);
    const favoriteCount = await favoriteModel.countBySiteId(siteId);
    const averageRating = await reviewModel.getAverageRatingBySiteId(siteId);

    let isFavorited = false;
    const authReq = req as AuthRequest;
    if (authReq.user && authReq.user.user_id) {
      isFavorited = await favoriteModel.exists(authReq.user.user_id, siteId);
    }

    res.status(200).json({
      ...site,
      reviews,
      favorite_count: favoriteCount,
      average_rating: averageRating,
      is_favorited: isFavorited
    });
  } catch (error) {
    console.error('Error in getSiteById:', error);
    res.status(500).json({ message: 'Error getting cultural site' });
  }
};

const searchSites = async (req: Request, res: Response): Promise<void> => {
  try {
    const query = (req.query.q as string) || '';
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;
    const sites = await culturalSiteModel.search(query, limit, offset);
    res.status(200).json(sites);
  } catch (error) {
    console.error('Error in searchSites:', error);
    res.status(500).json({ message: 'Error searching cultural sites' });
  }
};

const getSitesByType = async (req: Request, res: Response): Promise<void> => {
  try {
    const type = req.params.type;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;
    const sites = await culturalSiteModel.getByType(type, limit, offset);
    res.status(200).json(sites);
  } catch (error) {
    console.error('Error in getSitesByType:', error);
    res.status(500).json({ message: 'Error getting cultural sites by type' });
  }
};

const getSitesByCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const categoryId = parseInt(req.params.categoryId);
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const siteIds = await categoryModel.getSiteIds(categoryId, limit, offset);

    const sites = [];
    for (const siteId of siteIds) {
      const site = await culturalSiteModel.getById(siteId);
      if (site) sites.push(site);
    }

    res.status(200).json(sites);
  } catch (error) {
    console.error('Error in getSitesByCategory:', error);
    res
      .status(500)
      .json({ message: 'Error getting cultural sites by category' });
  }
};

const findNearbySites = async (req: Request, res: Response): Promise<void> => {
  try {
    const latitude = parseFloat(req.query.lat as string);
    const longitude = parseFloat(req.query.lng as string);
    const radius = parseFloat(req.query.radius as string) || 5;
    //  const limit = parseInt(req.query.limit as string) || 50;

    if (isNaN(latitude) || isNaN(longitude)) {
      res
        .status(400)
        .json({ message: 'Valid latitude and longitude are required' });
      return;
    }

    const sites = await culturalSiteModel.findNearby(
      latitude,
      longitude,
      radius
    );
    res.status(200).json(sites);
  } catch (error) {
    console.error('Error in findNearbySites:', error);
    res.status(500).json({ message: 'Error finding nearby cultural sites' });
  }
};

const fetchFromOSM = async (req: Request, res: Response): Promise<void> => {
  try {
    const latitude = parseFloat(req.query.lat as string);
    const longitude = parseFloat(req.query.lon as string);
    const radius = parseFloat(req.query.radius as string) || 5;

    if (isNaN(latitude) || isNaN(longitude)) {
      res
        .status(400)
        .json({ message: 'Valid latitude and longitude are required' });
      return;
    }

    const sites = await culturalSiteService.fetchFromOSM(
      latitude,
      longitude,
      radius
    );
    res.status(200).json(sites);
  } catch (error) {
    console.error('Error in fetchFromOSM:', error);
    res
      .status(500)
      .json({ message: 'Error fetching cultural sites from OpenStreetMap' });
  }
};

const culturalSiteRoutes = (app: express.Application) => {
  // Public routes
  app.get('/cultural-sites', getAllSites);
  app.get('/cultural-sites/search', searchSites);
  app.get('/cultural-sites/type/:type', getSitesByType);
  app.get('/cultural-sites/category/:categoryId', getSitesByCategory);
  app.get('/cultural-sites/nearby', findNearbySites);
  app.get('/cultural-sites/:id', getSiteById);

  // Protected route
  app.get('/cultural-sites/fetch/osm', verifyAuthToken, fetchFromOSM);
};

export { culturalSiteRoutes };
