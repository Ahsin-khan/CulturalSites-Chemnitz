import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/User';

@Component({
  standalone: true,
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  imports: [CommonModule, ReactiveFormsModule]
})

export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  currentUser: User | null = null;
  loading = false;
  saving = false;
  message = '';
  error = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.profileForm = this.fb.group({
      userName: ['', [Validators.required]],
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      location: ['']
    });
  }

  ngOnInit() {
    this.loading = true;
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.currentUser = user;
        this.profileForm.patchValue({
          userName: user.userName,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          location: user.location || ''
        });
      }
      this.loading = false;
    });
  }

  onSubmit() {
    if (this.profileForm.valid) {
      this.saving = true;
      this.message = '';
      this.error = '';

      this.authService.updateProfile(this.profileForm.value).subscribe({
        next: (user) => {
          this.currentUser = user;
          this.message = 'Profile updated successfully!';
          this.saving = false;
          setTimeout(() => this.message = '', 3000);
        },
        error: (error) => {
          this.error = error.error?.message || 'Failed to update profile';
          this.saving = false;
        }
      });
    }
  }
}