// signup.component.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  name: string = ''; // Add name property
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  errorMessage: string = '';

  constructor(private authService: AuthService, private router: Router, private firestore: AngularFirestore) {}

  signup() {
    if (this.password !== this.confirmPassword) {
      this.errorMessage = "Passwords do not match.";
      return;
    }
    this.errorMessage = '';
    this.authService.signup(this.email, this.password)
      .then((userCredential) => {
        this.logout()
        return userCredential.user?.updateProfile({
          displayName: this.name.trim()
        }).then(() => {
          this.firestore.collection('users').doc(userCredential.user?.uid).set({
            displayName: this.name.trim(),
            email: this.email
          });
        });
      })
      .catch((error) => {
        this.errorMessage = error.message;
      });
  }

  logout() {
    this.authService.logout().then(() => {
      this.router.navigate(['/login']);
    });
  }
}
