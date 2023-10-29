// navbar.component.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { User } from 'firebase/auth'; // Import User type from firebase/auth

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  user: User | null;

  constructor(private authService: AuthService, private router: Router) {
    this.user = null; 
  }

  ngOnInit() {
    this.authService.getCurrentUser().subscribe((user: User | null) => {
      this.user = user;
    });
  }

  logout() {
    this.authService.logout().then(() => {
      this.router.navigate(['/login']);
    });
  }
}
