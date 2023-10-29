// user-presence.service.ts
import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserPresenceService {
  constructor(private db: AngularFireDatabase, private auth: AngularFireAuth, private firestore: AngularFirestore) {}

  setUserOnlineStatus() {
    this.auth.user.subscribe((user) => {
      if (user) {
        const statusRef = this.db.object(`/users/${user.uid}`);
        statusRef.update({ online: true });
        statusRef.query.ref.onDisconnect().update({ online: false });
      }
    });
  }

  getUsersOnline(): Observable<any[]> {
    return this.db.list('/users', ref => ref.orderByChild('online').equalTo(true)).valueChanges();
  }

  getAllUsers(): Observable<any[]> {
    return this.firestore.collection('users').valueChanges();
  }
}
