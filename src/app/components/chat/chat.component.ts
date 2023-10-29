import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { UserPresenceService } from '../../services/user-presence.service';
import { AngularFirestore, AngularFirestoreCollection, DocumentChangeAction } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {
  user: any;
  message: string = '';
  messages!: Observable<any[]>;
  allUsers: any[] = [];
  selectedUser: any | null = null;

  private messagesCollection!: AngularFirestoreCollection<any>;

  constructor(
    private authService: AuthService,
    private userPresenceService: UserPresenceService,
    private firestore: AngularFirestore
  ) {}

  ngOnInit() {
    this.authService.getCurrentUser().subscribe((user: any) => {
      this.user = user;
      this.messagesCollection = this.firestore.collection('messages', ref => ref.orderBy('timestamp'));
      this.messages = this.messagesCollection.snapshotChanges().pipe(
        map((actions: DocumentChangeAction<any>[]) =>
          actions.map((a: DocumentChangeAction<any>) => ({ id: a.payload.doc.id, ...a.payload.doc.data() }))
            .filter(message => this.shouldShowMessage(message))
        )
      );
  
      // Fetch messages of the selected user if there is one
      if (this.selectedUser) {
        this.messages = this.messages.pipe(
          map(messages => messages.filter(message => 
            (message.sender === this.user.displayName && message.receiver === this.selectedUser?.displayName) ||
            (message.sender === this.selectedUser?.displayName && message.receiver === this.user.displayName)
          ))
        );
      }
    });

    this.userPresenceService.getAllUsers().subscribe(users => {
      this.allUsers = users.filter(u => u.displayName !== this.user.displayName);
    });
  }
  

  sendMessage() {
    if (this.message.trim() !== '') {
      const messageData: any = {
        sender: this.user.displayName || this.user.email,
        text: this.message,
        timestamp: new Date().getTime(),
        private: this.selectedUser !== null
      };

      if (this.selectedUser) {
        messageData.receiver = this.selectedUser.displayName;
      }

      this.messagesCollection.add(messageData);
      this.message = '';
    }
  }

  deleteMessage(message: any) {
    if (message.sender === this.user.displayName) {
      this.messagesCollection.doc(message.id).delete()
        .catch(error => console.error('Error deleting message:', error));
    }
  }

  isPrivateMessage(message: any): boolean {
    return message.private === true;
  }

  shouldShowMessage(message: any): boolean {
    if (this.isPrivateMessage(message)) {
      return (message.sender === this.user.displayName && message.receiver === this.selectedUser?.displayName) ||
             (message.sender === this.selectedUser?.displayName && message.receiver === this.user.displayName);
    } else {
      return true;
    }
  }

  selectUser(user: any) {
    this.selectedUser = user;
  }
}
