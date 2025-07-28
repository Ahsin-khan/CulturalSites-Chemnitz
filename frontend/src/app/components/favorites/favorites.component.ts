import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { FavoritesService } from '../../services/favorites.service';
import { CulturalSite } from '../../models/CulturalSite';
import { Favorite } from '../../models/Favorites';

@Component({
  standalone: true,
  selector: 'app-favorites',
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.css'],
  imports: [CommonModule, RouterModule]
})

export class FavoritesComponent implements OnInit {
  favorites: Favorite[] = [];
  loading = true;
  error = '';

  constructor(private favoritesService: FavoritesService) {}

  ngOnInit() {
    this.loadFavorites();
  }

  loadFavorites() {
    this.favoritesService.getFavorites().subscribe({
      next: (favorites) => {
        this.favorites = favorites;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load favorites';
        this.loading = false;
        console.error('Error loading favorites:', error);
      }
    });
  }

  removeFromFavorites(siteId: number) {
    this.favoritesService.removeFromFavorites(siteId).subscribe({
      next: () => {
        // Remove the entire favorite entry where the site's id matches
        this.favorites = this.favorites.filter(fav => fav.site.id !== siteId);
      },
      error: (error) => {
        console.error('Failed to remove from favorites:', error);
      }
    });
  }


  getProxiedImageUrl(url: string): string {
  if (!url) return '';

  const wikiMatch = url.match(/https:\/\/commons\.wikimedia\.org\/wiki\/File:(.+)/);
  if (wikiMatch) {
    const filename = wikiMatch[1];
    return `https://commons.wikimedia.org/wiki/Special:FilePath/${filename}`;
  }

  // For other image URLs (optional proxy)
  return `https://images.weserv.nl/?url=${encodeURIComponent(url.replace(/^https?:\/\//, ''))}`;
}

}