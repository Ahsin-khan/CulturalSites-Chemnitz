import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ReviewsService } from '../../services/reviews.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-site-review',
  templateUrl: './site-review.component.html',
  styleUrls: ['./site-review.component.css'],
  imports: [CommonModule, RouterModule, FormsModule]
})
export class SiteReviewComponent implements OnInit {
  siteId!: number;
  rating: number = 0;
  hoverRating: number = 0; // for hover effect
  comment: string = '';
  message: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private reviewsService: ReviewsService
  ) {}

  ngOnInit(): void {
    this.siteId = Number(this.route.snapshot.paramMap.get('id'));
  }

  setRating(star: number): void {
    this.rating = star;
  }

  submitReview(): void {
    if (!this.rating || !this.comment.trim()) {
      this.message = 'Please provide both rating and comment.';
      return;
    }
    this.reviewsService.submitReview(this.siteId, {
      rating: this.rating,
      comment: this.comment
    }).subscribe({
      next: () => {
        this.message = 'Review submitted successfully!';
        setTimeout(() => this.router.navigate(['/sites', this.siteId]), 1500);
      },
      error: (err) => {
        console.error('Failed to submit review:', err);
        this.message = 'Failed to submit review.';
      }
    });
  }
}
