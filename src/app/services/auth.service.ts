// auth.service.ts
import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
// import { User } from '../models/user';
import { Observable, map, switchMap } from 'rxjs';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private auth: AngularFireAuth, private router: Router, private firestore: AngularFirestore) {}

  login(email: string, password: string) {
    return this.auth.signInWithEmailAndPassword(email, password);
  }

  signup(email: string, password: string) {
    return this.auth.createUserWithEmailAndPassword(email, password);
  }

  logout() {
    return this.auth.signOut().then(() => {
      this.router.navigate(['/login']);
    });
  }

  getCurrentUser(): any {
    return this.auth.authState.pipe(
      switchMap((user) => {
        if (user) {
          // If the user is logged in, fetch the profilePictureUrl from Firestore and return the user object with the property
          const userRef = this.firestore.collection('users').doc<any>(user.uid);
          return userRef.valueChanges();
        } else {
          return new Observable<any>((observer) => observer.next(null));
        }
      })
    );
  }

  
}
