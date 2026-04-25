import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'nc-app-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent],
  templateUrl: './app-layout.component.html',
})
export class AppLayoutComponent {}
