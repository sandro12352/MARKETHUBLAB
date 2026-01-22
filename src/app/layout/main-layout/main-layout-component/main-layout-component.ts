import { Component } from '@angular/core';
import { SideBarComponent } from '../../../shared/components/sidebar/side-bar-component/side-bar-component';
import { HeaderComponent } from '../../../shared/components/header/header-component/header-component';
import { RouterOutlet } from '@angular/router';


@Component({
  selector: 'app-main-layout-component',
  standalone:true,
  imports: [SideBarComponent, HeaderComponent, RouterOutlet],
  templateUrl: './main-layout-component.html',
  styleUrl: './main-layout-component.css',
})
export class MainLayoutComponent {

}
