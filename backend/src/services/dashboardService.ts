import userModel from '../models/user';
import favoriteModel from '../models/favorite';
import reviewModel from '../models/review';
import culturalSiteModel from '../models/culturalSite';
import categoryModel from '../models/category';
import { DashboardData } from '../types/types';

export class DashboardService {
  /**
   * Get dashboard data for a user
   * @param userId - User ID
   * @returns Dashboard data
   */
  async getUserDashboard(userId: number): Promise<DashboardData | null> {
    try {
      // Get user
      const user = await userModel.show(userId);
      if (!user) {
        return null;
      }

      // Get favorites
      const favorites = await favoriteModel.getByUserId(userId);
      const favoriteSites = [];

      // Get details for each favorite site
      for (const favorite of favorites) {
        const site = await culturalSiteModel.getById(favorite.site_id);
        if (site) {
          const categories = await categoryModel.getBySiteId(site.id);
          favoriteSites.push({
            ...site,
            categories
          });
        }
      }

      // Get recent reviews
      const userReviews = await reviewModel.getByUserId(userId);
      const recentReviews = [];

      // Get details for each reviewed site
      for (const review of userReviews) {
        const site = await culturalSiteModel.getById(review.site_id);
        if (site) {
          recentReviews.push({
            ...review,
            site
          });
        }
      }

      // Omit password hash from user
      const { password_hash, ...userWithoutPassword } = user;

      // Return dashboard data
      return {
        user: userWithoutPassword as any,
        totalFavorites: favoriteSites.length,
        totalReviews: recentReviews.length,
        favorites: favoriteSites,
        recentReviews,
        totalSites: await culturalSiteModel.countAll()
      };
    } catch (error) {
      console.error('Error getting user dashboard:', error);
      throw new Error(`Could not get user dashboard: ${error}`);
    }
  }

  /**
   * Get nearby cultural sites for a user
   * @param userId - User ID
   * @param radius - Radius in kilometers
   * @returns Array of nearby cultural sites
   */
  async getNearbyPlaces(userId: number, radius: number = 5): Promise<any[]> {
    try {
      // Get user
      const user = await userModel.show(userId);
      if (!user || !user.location_lat || !user.location_lon) {
        return [];
      }

      // Get nearby sites
      const nearbySites = await culturalSiteModel.findNearby(
        user.location_lat,
        user.location_lon,
        radius
      );

      // Get details for each site
      const sitesWithDetails = [];
      for (const site of nearbySites) {
        const categories = await categoryModel.getBySiteId(site.id);
        sitesWithDetails.push({
          ...site,
          categories,
          distance: site.distance
            ? parseFloat(Number(site.distance).toFixed(2))
            : null
        });
      }

      return sitesWithDetails;
    } catch (error) {
      console.error('Error getting nearby places:', error);
      throw new Error(`Could not get nearby places: ${error}`);
    }
  }
}

export default new DashboardService();
