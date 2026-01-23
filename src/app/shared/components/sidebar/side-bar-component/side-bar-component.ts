import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterLink, RouterLinkActive } from "@angular/router";

@Component({
  selector: 'app-side-bar-component',
  standalone:true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './side-bar-component.html',
  styleUrl: './side-bar-component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SideBarComponent {

}
