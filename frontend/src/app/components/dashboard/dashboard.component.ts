import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import * as L from 'leaflet';

import { DashboardService } from '../../services/dashboard.service';
import { CulturalSitesService } from '../../services/cultural-sites.service';
import { DashboardData } from '../../models/Dashboard';
import { CulturalSite } from '../../models/CulturalSite';

@Component({
  standalone: true,
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  imports: [CommonModule, RouterModule]
})
export class DashboardComponent implements OnInit {
  dashboardData: DashboardData | null = null;
  nearbySites: CulturalSite[] = [];
  loading = true;
  error = '';

  map: L.Map | null = null;
  userMarker: L.Marker | null = null;
  siteMarkers: L.Marker[] = [];

  constructor(
    private dashboardService: DashboardService,
    private culturalSitesService: CulturalSitesService
  ) {}

  ngOnInit() {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
    });

    this.loadDashboard();
    this.loadNearbySites();
  }

  loadDashboard() {
    this.dashboardService.getDashboardData().subscribe({
      next: (data) => {
        this.dashboardData = data;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load dashboard data';
        this.loading = false;
      }
    });
  }

  loadNearbySites() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          console.log('[Geolocation] Your coordinates:', lat, lng);

          this.culturalSitesService.getNearbySites(lat, lng, 5).subscribe({
            next: (sites) => {
              this.nearbySites = sites;

              // Delay until DOM is rendered
              setTimeout(() => {
                const mapContainer = document.getElementById('map');
                if (mapContainer) {
                  this.initMap(lat, lng, sites);
                } else {
                  console.error('Map container not found on return to dashboard');
                }
              }, 50); // Slight delay to let DOM catch up
            },
            error: (error) => {
              console.error('Failed to load nearby sites:', error);
            }
          });
        },
        (error) => {
          console.error('Geolocation error:', error);
        },
        { enableHighAccuracy: true }
      );
    }
  }

   initMap(userLat: number, userLng: number, sites: CulturalSite[]) {
    if (this.map) {
      this.map.remove(); // clean up old instance
    }

    const mapElement = document.getElementById('map');
    if (!mapElement) {
      console.error('Map container not found');
      return;
    }

    this.map = L.map(mapElement).setView([userLat, userLng], 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    this.userMarker = L.marker([userLat, userLng], {
      icon: L.icon({
        iconUrl: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
      })
    }).addTo(this.map).bindPopup("You are here").openPopup();

    this.siteMarkers = sites.map(site => {
      const marker = L.marker([+site.latitude, +site.longitude], {
        icon: L.icon({
          iconUrl: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
        })
      }).addTo(this.map!)
        .bindPopup(
          `<b>${site.name}</b><br>${site.type || 'Unknown type'}<br><br>${site.distance?.toFixed(2) || 'N/A'} km away`
        );
        return marker;
    });
  } 

  // Nearby Sites Pagination
  nearbyCurrentPage: number = 1;
  nearbyItemsPerPage: number = 10;

  get totalNearbyPages(): number {
    return Math.ceil(this.nearbySites?.length / this.nearbyItemsPerPage);
  }

  paginatedNearbySites() {
    if (!this.nearbySites) return [];
    const startIndex = (this.nearbyCurrentPage - 1) * this.nearbyItemsPerPage;
    return this.nearbySites.slice(startIndex, startIndex + this.nearbyItemsPerPage);
  }

  nextNearbyPage() {
    if (this.nearbyCurrentPage < this.totalNearbyPages) {
      this.nearbyCurrentPage++;
    }
  }

  prevNearbyPage() {
    if (this.nearbyCurrentPage > 1) {
      this.nearbyCurrentPage--;
    }
  }
}
