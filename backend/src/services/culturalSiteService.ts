import axios from 'axios';
import culturalSiteModel from '../models/culturalSite';
import categoryModel from '../models/category';
import {
  CulturalSite,
  CulturalSiteCreation,
  OverpassResult,
  OverpassElement
} from '../types/types';

export class CulturalSiteService {
  private readonly OVERPASS_API_URL = 'https://overpass-api.de/api/interpreter';

  /**
   * Fetch cultural sites from OpenStreetMap via Overpass API
   * @param latitude - Central latitude
   * @param longitude - Central longitude
   * @param radius - Radius in kilometers
   * @returns Array of cultural sites
   */
  async fetchFromOSM(
    latitude: number,
    longitude: number,
    radius: number = 5
  ): Promise<CulturalSite[]> {
    try {
      // Create Overpass QL query to fetch cultural places
      const query = `
        [out:json];
        (
          // Museums
          node["tourism"="museum"](around:${radius * 1000},${latitude},${longitude});
          way["tourism"="museum"](around:${radius * 1000},${latitude},${longitude});
          relation["tourism"="museum"](around:${radius * 1000},${latitude},${longitude});
          
          // Monuments
          node["historic"="monument"](around:${radius * 1000},${latitude},${longitude});
          way["historic"="monument"](around:${radius * 1000},${latitude},${longitude});
          relation["historic"="monument"](around:${radius * 1000},${latitude},${longitude});
          
          // Historical places
          node["historic"](around:${radius * 1000},${latitude},${longitude});
          way["historic"](around:${radius * 1000},${latitude},${longitude});
          relation["historic"](around:${radius * 1000},${latitude},${longitude});
          
          // Art galleries
          node["tourism"="gallery"](around:${radius * 1000},${latitude},${longitude});
          way["tourism"="gallery"](around:${radius * 1000},${latitude},${longitude});
          relation["tourism"="gallery"](around:${radius * 1000},${latitude},${longitude});
          
          // Theaters
          node["amenity"="theatre"](around:${radius * 1000},${latitude},${longitude});
          way["amenity"="theatre"](around:${radius * 1000},${latitude},${longitude});
          relation["amenity"="theatre"](around:${radius * 1000},${latitude},${longitude});
          
          // Libraries
          node["amenity"="library"](around:${radius * 1000},${latitude},${longitude});
          way["amenity"="library"](around:${radius * 1000},${latitude},${longitude});
          relation["amenity"="library"](around:${radius * 1000},${latitude},${longitude});

          // Restaurants
          node["amenity"="restaurant"](around:${radius * 1000},${latitude},${longitude});
          way["amenity"="restaurant"](around:${radius * 1000},${latitude},${longitude});
          relation["amenity"="restaurant"](around:${radius * 1000},${latitude},${longitude});
        );
        out center;
      `;

      // Make request to Overpass API
      const response = await axios.post(this.OVERPASS_API_URL, query, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      // Process response
      const data: OverpassResult = response.data;
      const sites: CulturalSite[] = [];

      // Process each element from the Overpass response
      for (const element of data.elements) {
        // Skip elements without name
        if (!element.tags?.name) {
          continue;
        }

        // Convert OSM element to our format
        const site = await this.processOSMElement(element);
        if (site) {
          // Check if site already exists in our database
          const existingSite = await culturalSiteModel.getByOsmId(element.id);

          if (existingSite) {
            // Update existing site with new data
            const updatedSite = await culturalSiteModel.update(
              existingSite.id,
              site
            );
            sites.push(updatedSite);
          } else {
            // Create new site
            const newSite = await culturalSiteModel.create(site);

            // Add categories
            await this.addCategoriesToSite(newSite.id, element.tags);

            sites.push(newSite);
          }
        }
      }

      return sites;
    } catch (error) {
      console.error('Error fetching cultural sites from OSM:', error);
      throw new Error(`Could not fetch cultural sites from OSM: ${error}`);
    }
  }

  /**
   * Process an OpenStreetMap element into a cultural site
   * @param element - OpenStreetMap element
   * @returns Cultural site creation data
   */
  private async processOSMElement(
    element: OverpassElement
  ): Promise<CulturalSiteCreation | null> {
    try {
      // Get latitude and longitude
      let lat: number, lon: number;

      if (element.type === 'node' && element.lat && element.lon) {
        // For nodes, use direct lat/lon
        lat = element.lat;
        lon = element.lon;
      } else if (element.center) {
        // For ways and relations, use center
        lat = element.center.lat;
        lon = element.center.lon;
      } else if (element.geometry && element.geometry.length > 0) {
        // If geometry is available, use first point
        lat = element.geometry[0].lat;
        lon = element.geometry[0].lon;
      } else {
        // Skip if no location data
        return null;
      }

      // Determine type
      let type = 'other';
      if (element.tags?.tourism === 'museum') {
        type = 'museum';
      } else if (element.tags?.historic === 'monument') {
        type = 'monument';
      } else if (element.tags?.historic) {
        type = 'historical';
      } else if (element.tags?.tourism === 'gallery') {
        type = 'gallery';
      } else if (element.tags?.amenity === 'theatre') {
        type = 'theatre';
      } else if (element.tags?.amenity === 'library') {
        type = 'library';
      } else if (element.tags?.amenity === 'restaurant') {
        type = 'restaurant';
      }

      // Extract address components
      const address = {
        street: element.tags?.['addr:street'],
        housenumber: element.tags?.['addr:housenumber'],
        city: element.tags?.['addr:city'],
        postcode: element.tags?.['addr:postcode'],
        country: element.tags?.['addr:country']
      };

      // Create cultural site
      return {
        osm_id: element.id,
        name: element.tags?.name || 'Unknown',
        type,
        description:
          element.tags?.description || element.tags?.note || undefined,
        latitude: lat,
        longitude: lon,
        address: Object.values(address).some((v) => v) ? address : null,
        opening_hours: element.tags?.opening_hours || undefined,
        website: element.tags?.website || element.tags?.url || undefined,
        phone:
          element.tags?.phone || element.tags?.['contact:phone'] || undefined,
        tags: element.tags || {}
      };
    } catch (error) {
      console.error('Error processing OSM element:', error);
      return null;
    }
  }

  /**
   * Add categories to a site based on its tags
   * @param siteId - Site ID
   * @param tags - OSM tags
   */
  private async addCategoriesToSite(siteId: number, tags: any): Promise<void> {
    try {
      // Map of OSM tags to category names
      const categoryMappings: { [key: string]: string[] } = {
        'tourism=museum': ['Museum'],
        'historic=monument': ['Monument'],
        'historic=archaeological_site': ['Archaeological Site'],
        'historic=building': ['Historical Building'],
        'tourism=gallery': ['Art Gallery'],
        'amenity=theatre': ['Theater'],
        'amenity=library': ['Library'],
        'amenity=place_of_worship': ['Religious Site'],
        'amenity=arts_centre': ['Cultural Center'],
        'amenity=restaurant': ['Restaurants']
      };

      // Set to track added categories to avoid duplicates
      const addedCategories = new Set<string>();

      // Add categories based on mappings
      for (const [tagPattern, categoryNames] of Object.entries(
        categoryMappings
      )) {
        const [key, value] = tagPattern.split('=');

        if (tags[key] === value) {
          for (const categoryName of categoryNames) {
            if (!addedCategories.has(categoryName)) {
              // Get all categories
              const categories = await categoryModel.getAll();

              // Find category by name
              const category = categories.find((c) => c.name === categoryName);

              if (category) {
                await categoryModel.addToSite(siteId, category.id);
                addedCategories.add(categoryName);
              }
            }
          }
        }
      }

      // Add special categories based on other tags
      if (tags.museum && !addedCategories.has('Museum')) {
        const categories = await categoryModel.getAll();
        const category = categories.find((c) => c.name === 'Museum');
        if (category) {
          await categoryModel.addToSite(siteId, category.id);
        }
      }
    } catch (error) {
      console.error('Error adding categories to site:', error);
    }
  }

  /**
   * Get cultural site with related data
   * @param siteId - Site ID
   * @returns Cultural site with categories and reviews
   */
  async getSiteWithDetails(siteId: number): Promise<any> {
    try {
      // Get site
      const site = await culturalSiteModel.getById(siteId);
      if (!site) {
        return null;
      }

      // Get categories
      const categories = await categoryModel.getBySiteId(siteId);

      // Return site with categories
      return {
        ...site,
        categories
      };
    } catch (error) {
      console.error('Error getting site with details:', error);
      throw new Error(`Could not get site with details: ${error}`);
    }
  }
}

export default new CulturalSiteService();
