import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { ReviewsService } from '../../services/reviews.service';
import { Review } from '../../models/Review';

@Component({
  standalone: true,
  selector: 'app-review-list',
  templateUrl: './review-list.component.html',
  styleUrls: ['./review-list.component.css'],
  imports: [CommonModule, RouterModule, FormsModule]
})

export class ReviewListComponent implements OnInit {
  reviews: Review[] = [];
  loading = true;
  error = '';
  editingReview: Review | null = null;
  hoverRating: number = 0;

  constructor(private reviewsService: ReviewsService) {}

  ngOnInit() {
    this.loadUserReviews();
  }

  loadUserReviews() {
    this.reviewsService.getUserReviews().subscribe({
      next: (reviews) => {
        this.reviews = reviews;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load reviews';
        this.loading = false;
      }
    });
  }

  editReview(review: Review) {
        // Create a copy so the original isn't edited until submission
        this.editingReview = { ...review };
      }

      cancelEdit() {
        this.editingReview = null;
      }

      submitEdit() {
        if (!this.editingReview) return;

        this.reviewsService.updateReview(this.editingReview.id, {
          rating: this.editingReview.rating,
          comment: this.editingReview.comment
        }).subscribe({
          next: (updated) => {
            const index = this.reviews.findIndex(r => r.id === updated.id);
            if (index !== -1) {
              this.reviews[index] = { ...this.reviews[index], ...updated };
            }
            this.editingReview = null;
          },
          error: (err) => {
            console.error('Failed to update review', err);
          }
        });
    }


  deleteReview(reviewId: number) {
    if (confirm('Are you sure you want to delete this review?')) {
      this.reviewsService.deleteReview(reviewId).subscribe({
        next: () => {
          this.reviews = this.reviews.filter(review => review.id !== reviewId);
        },
        error: (error) => {
          console.error('Failed to delete review:', error);
        }
      });
    }
  }

  getStarsArray(rating: number): number[] {
    return Array.from({length: 5}, (_, i) => i + 1);
  }
}