import { Component } from '@angular/core';

import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatBadgeModule } from '@angular/material/badge';

import { AccountService } from '@app/_services';
import { User } from '@app/_models';
import { NgIf, DatePipe } from '@angular/common';
import { AlertComponent } from '../alert/alert.component';

@Component({
  selector: 'app-menubar',
  templateUrl: 'menubar.component.html',
  styleUrls: ['menubar.component.css'],
  standalone: true,
  imports: [
    RouterOutlet,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatListModule,
    MatSidenavModule,
    MatBadgeModule,
    AlertComponent,
    NgIf, RouterLink, RouterLinkActive
  ],
  providers: [DatePipe]
})
export class MenubarComponent {
  badgeVisible = false;
  openDrawer = false;

  user?: User | null;

  currentDateTime: string | undefined;
  
  constructor(private accountService: AccountService, private datePipe: DatePipe) {
    this.accountService.user.subscribe(x => this.user = x);
    if (this.user) { this.openDrawer = true; }

    this.updateCurrentDateTime(); // Initial call
    setInterval(() => this.updateCurrentDateTime(), 1000); // Update every second
  }

  logout() {
    this.openDrawer = false;
    this.accountService.logout();
  }

  badgeVisibility() {
    this.badgeVisible = true;
  }

  updateCurrentDateTime() {
    const currentDate = new Date();
    // const options: Intl.DateTimeFormatOptions = {
    //   weekday: 'long',
    //   year: 'numeric',
    //   month: 'long',
    //   day: 'numeric',
    //   hour: '2-digit',
    //   minute: '2-digit',
    //   second: '2-digit'
    // };
    // this.currentDateTime = currentDate.toLocaleDateString('en-US', options);
    const formattedDate = this.datePipe.transform(currentDate, 'E MM/dd/yyyy \'at\' hh:mm:ss a');
    this.currentDateTime = formattedDate as string;
  }
}
