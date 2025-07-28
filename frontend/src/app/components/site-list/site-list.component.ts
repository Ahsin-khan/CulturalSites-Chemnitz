import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CulturalSitesService } from '../../services/cultural-sites.service';
import { CulturalSite, Category } from '../../models/CulturalSite';
import { RouterModule } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-site-list',
  templateUrl: './site-list.component.html',
  styleUrls: ['./site-list.component.css'],
  imports: [CommonModule, FormsModule, RouterModule]
})

export class SiteListComponent implements OnInit {
  sites: CulturalSite[] = [];
  categories: Category[] = [];
  filteredSites: CulturalSite[] = [];
  loading = true;
  error = '';

  // Filter options
  searchQuery = '';
  selectedType = '';
  selectedCategory = '';
  siteTypes = ['museum', 'monument', 'archaeological_site', 'historic_building', 'art_gallery', 'cultural_center', 'restaurents'];

  constructor(private culturalSitesService: CulturalSitesService) {}

  ngOnInit() {
    this.loadSites();
    this.loadCategories();
  }

  loadSites() {
    this.culturalSitesService.getCulturalSites().subscribe({
      next: (sites) => {
        // Populate site.images from tags.image if needed
        this.sites = sites.map(site => {
          if (!site.images || site.images.length === 0) {
            if (site.tags && site.tags['image']) {
              site.images = [site.tags['image']];
            }
          }
          return site;
        });

        this.filteredSites = this.sites;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load sites';
        this.loading = false;
      }
    });
  }


  loadCategories() {
    this.culturalSitesService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (error) => {
        console.error('Failed to load categories:', error);
      }
    });
  }

  onSearch() {
    if (this.searchQuery.trim()) {
      this.culturalSitesService.searchSites(this.searchQuery, {
        type: this.selectedType,
        category: this.selectedCategory
      }).subscribe({
        next: (sites) => {
          this.filteredSites = sites;
        },
        error: (error) => {
          console.error('Search failed:', error);
        }
      });
    } else {
      this.applyFilters();
    }
  }

  applyFilters() {
    this.filteredSites = this.sites.filter(site => {
      let matches = true;

      if (this.selectedType) {
        matches = matches && site.type === this.selectedType;
      }

      if (this.selectedCategory) {
        matches = matches && (site.categories?.some(cat => cat.id.toString() === this.selectedCategory) ?? false);

      }

      return matches;
    });
  }

  onTypeChange() {
    if (this.selectedType) {
      this.culturalSitesService.getSitesByType(this.selectedType).subscribe({
        next: (sites) => {
          this.filteredSites = sites;
        },
        error: (error) => {
          console.error('Failed to filter by type:', error);
        }
      });
    } else {
      this.applyFilters();
    }
  }

  onCategoryChange() {
    if (this.selectedCategory) {
      this.culturalSitesService.getSitesByCategory(parseInt(this.selectedCategory)).subscribe({
        next: (sites) => {
          this.filteredSites = sites;
        },
        error: (error) => {
          console.error('Failed to filter by category:', error);
        }
      });
    } else {
      this.applyFilters();
    }
  }

  clearFilters() {
    this.searchQuery = '';
    this.selectedType = '';
    this.selectedCategory = '';
    this.filteredSites = this.sites;
  }

  
    // 👇 Proxy & Fix Wikimedia image URLs
  getProxiedImageUrl(url: string): string {
    if (!url) return '';

    const wikiMatch = url.match(/https:\/\/commons\.wikimedia\.org\/wiki\/File:(.+)/);
    if (wikiMatch) {
      const filename = wikiMatch[1];
      return `https://commons.wikimedia.org/wiki/Special:FilePath/${filename}`;
    }

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

    // Pagination
    pageSize = 12;  // number of sites per page
    currentPage = 1;

    get paginatedSites() {
      const startIndex = (this.currentPage - 1) * this.pageSize;
      return this.filteredSites.slice(startIndex, startIndex + this.pageSize);
    }

    get totalPages() {
      return Math.ceil(this.filteredSites.length / this.pageSize);
    }

    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
      }
    }

    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
      }
    }

    goToPage(page: number) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
      }
    }


}