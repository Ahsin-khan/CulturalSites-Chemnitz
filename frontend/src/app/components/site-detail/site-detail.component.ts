import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { ActivatedRoute } from '@angular/router';
import { CulturalSitesService } from '../../services/cultural-sites.service';
import { FavoritesService } from '../../services/favorites.service';
import { ReviewsService } from '../../services/reviews.service';
import { CulturalSite } from '../../models/CulturalSite';
import { Review } from '../../models/Review';

@Component({
  standalone: true,
  selector: 'app-site-detail',
  templateUrl: './site-detail.component.html',
  styleUrls: ['./site-detail.component.css'],
  imports: [CommonModule, RouterModule]
})
export class SiteDetailComponent implements OnInit {
  site: CulturalSite | null = null;
  reviews: Review[] = [];
  isFavorite = false;
  loading = true;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private culturalSitesService: CulturalSitesService,
    private favoritesService: FavoritesService,
    private reviewsService: ReviewsService
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.loadSite(id);
      this.loadReviews(id);
      this.checkFavoriteStatus(id);
    }
  }

  loadSite(id: number) {
    this.culturalSitesService.getSiteById(id).subscribe({
      next: (site) => {
        // Assign site from API
        this.site = site;

        // Fallback to tags if data is missing
        if (this.site.tags) {
          this.site.images = this.site.images || (this.site.tags['image'] ? [this.site.tags['image']] : []);
          this.site.description = this.site.description || this.site.tags['memorial:text'];
          this.site.address = this.site.address || this.site.tags['memorial:addr'];
        }

        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load site details';
        this.loading = false;
      }
    });
  }

  loadReviews(siteId: number) {
    this.reviewsService.getReviewsForSite(siteId).subscribe({
      next: (reviews) => {
        this.reviews = reviews;
      },
      error: (error) => {
        console.error('Failed to load reviews:', error);
      }
    });
  }

  checkFavoriteStatus(siteId: number) {
    this.favoritesService.checkFavoriteStatus(siteId).subscribe({
      next: (response) => {
        this.isFavorite = response.isFavorite;
      },
      error: (error) => {
        console.error('Failed to check favorite status:', error);
      }
    });
  }

  toggleFavorite() {
    if (!this.site) return;

    if (this.isFavorite) {
      this.favoritesService.removeFromFavorites(this.site.id).subscribe({
        next: () => {
          this.isFavorite = false;
        },
        error: (error) => {
          console.error('Failed to remove from favorites:', error);
        }
      });
    } else {
      this.favoritesService.addToFavorites(this.site.id).subscribe({
        next: () => {
          this.isFavorite = true;
        },
        error: (error) => {
          console.error('Failed to add to favorites:', error);
        }
      });
    }
  }

  getStarsArray(rating: number): number[] {
    return Array.from({ length: 5 }, (_, i) => i + 1);
  }

    getProxiedImageUrl(url: string): string {
    if (!url) return '';

    // Check if it's a Wikimedia "File:" page
    const wikiMatch = url.match(/https:\/\/commons\.wikimedia\.org\/wiki\/File:(.+)/);
    if (wikiMatch) {
      const filename = wikiMatch[1];
      // Direct image URL construction for Wikimedia
      const directUrl = `https://commons.wikimedia.org/wiki/Special:FilePath/${filename}`;
      return directUrl; // optionally add a proxy here if you face CORS again
    }

    // For other URLs, fallback to proxy
    return `https://images.weserv.nl/?url=${encodeURIComponent(url.replace(/^https?:\/\//, ''))}`;
  }

  formatAddress(site: any): string {
  // If address is a string
  if (typeof site.address === 'string') {
    return site.address;
  }

  // If address is an object
  if (typeof site.address === 'object' && site.address !== null) {
    const { street, housenumber, postcode, city } = site.address;
    return `${street ?? ''} ${housenumber ?? ''}, ${postcode ?? ''} ${city ?? ''}`.trim();
  }

  // If address is in tags
  if (site.tags?.['memorial:addr']) {
    return site.tags['memorial:addr'];
  }

  return 'Address not available';
}

}
