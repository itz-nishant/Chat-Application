import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  user: any;
  profilePictureUrl: string | null = null;
  selectedProfilePicture: File | null = null;
  isUploading = false;

  constructor(
    private authService: AuthService,
    private firestore: AngularFirestore,
    private storage: AngularFireStorage
  ) {}

  ngOnInit() {
    this.authService.getCurrentUser().subscribe((user: any) => {
      this.user = user;
      this.fetchProfilePictureUrl();
    });
  }
  isDisplayNameEditing = false;
  updatedDisplayName = '';

  enableDisplayNameEditing() {
    this.isDisplayNameEditing = true;
    this.updatedDisplayName = this.user?.displayName || '';
  }

async saveDisplayName() {
  if (this.updatedDisplayName !== '') {
    this.isDisplayNameEditing = false;

    if (this.user && this.user.displayName) {
      const newDisplayName = this.updatedDisplayName.trim();
      const userRef = this.firestore.collection('users').doc(this.user.uid);

      try {
        await userRef.update({ displayName: newDisplayName });
        console.log('Display name updated successfully!');
        this.user.displayName = newDisplayName; // Update the local user object
      } catch (error) {
        console.error('Error updating display name:', error);
      }
    }
  }
}

  
  
  
  
  

  onDisplayNameChange(event: any) {
    this.updatedDisplayName = event.target.value;
  }

  fetchProfilePictureUrl() {
    if (this.user) {
      const userRef = this.firestore.collection('users').doc<any>(this.user.uid); // Set the type to 'any'
      userRef.get().subscribe((doc) => {
        if (doc.exists) {
          this.profilePictureUrl = doc.data()?.profilePictureUrl;
        } else {
          this.profilePictureUrl = null;
        }
      });
    }
  }

  updateDisplayName() {
    if (this.user && this.user.displayName) {
      const newDisplayName = this.user.displayName.trim();
      if (newDisplayName !== '') {
        this.firestore.collection('users').doc(this.user.uid).update({ displayName: newDisplayName })
          .then(() => {
            console.log('Display name updated successfully!');
          })
          .catch((error) => {
            console.error('Error updating display name:', error);
          });
      }
    }
  }

  uploadProfilePicture() {
    if (this.selectedProfilePicture) {
      this.isUploading = true;
      const file = this.selectedProfilePicture;
      const filePath = `profile_pictures/${this.user.uid}_${file.name}`;
      const fileRef = this.storage.ref(filePath);
      const task = this.storage.upload(filePath, file);

      // Get notified when the file upload completes and get the download URL
      task.snapshotChanges().pipe(
        finalize(() => {
          fileRef.getDownloadURL().subscribe((url) => {
            this.isUploading = false;
            this.profilePictureUrl = url;
            this.saveProfilePictureUrlToFirestore(url);
          });
        })
      ).subscribe();
    }
  }

  deleteProfilePicture() {
    if (this.profilePictureUrl) {
      this.isUploading = true;
      const filePath = `profile_pictures/${this.user.uid}`;
      const fileRef = this.storage.ref(filePath);

      // Delete the profile picture from Firebase Storage
      fileRef.delete().subscribe(() => {
        this.isUploading = false;
        this.profilePictureUrl = null;
        this.saveProfilePictureUrlToFirestore(null);
      });
    }
  }

  private saveProfilePictureUrlToFirestore(url: string | null) {
    if (this.user) {
      const userRef = this.firestore.collection('users').doc(this.user.uid);
      userRef.set({ profilePictureUrl: url }, { merge: true });
    }
  }

  onProfilePictureSelected(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement.files && inputElement.files.length > 0) {
      this.selectedProfilePicture = inputElement.files[0];
    }
  }
}
