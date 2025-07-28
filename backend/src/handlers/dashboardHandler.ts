import express, { Request, Response } from 'express';
import { verifyAuthToken } from '../helpers/verifyAuthToken';
import dashboardService from '../services/dashboardService';
import { AuthRequest } from '../types/types';

async function getUserDashboard(req: Request, res: Response): Promise<void> {
  try {
    const authReq = req as AuthRequest;

    if (!authReq.user || !authReq.user.user_id) {
      res.status(401).json({ message: 'Not authenticated.' });
      return;
    }

    const userId = authReq.user.user_id;
    const dashboardData = await dashboardService.getUserDashboard(userId);

    if (!dashboardData) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.status(200).json(dashboardData);
  } catch (error) {
    console.error('Error in getUserDashboard:', error);
    res.status(500).json({ message: 'Error getting user dashboard' });
  }
}

async function getNearbyPlaces(req: Request, res: Response): Promise<void> {
  try {
    const authReq = req as AuthRequest;

    if (!authReq.user || !authReq.user.user_id) {
      res.status(401).json({ message: 'Not authenticated.' });
      return;
    }

    const userId = authReq.user.user_id;
    const radius = parseFloat(req.query.radius as string) || 5;
    //console.log('Radius used:', radius);

    const nearbyPlaces = await dashboardService.getNearbyPlaces(userId, radius);

    res.status(200).json(nearbyPlaces);
  } catch (error) {
    console.error('Error in getNearbyPlaces:', error);
    res.status(500).json({ message: 'Error getting nearby places' });
  }
}

const dashboardRoutes = (app: express.Application) => {
  // Apply auth middleware for all /dashboard routes
  app.use('/dashboard', verifyAuthToken);

  app.get('/dashboard', getUserDashboard);
  app.get('/dashboard/nearby', getNearbyPlaces);
};

export { dashboardRoutes };
