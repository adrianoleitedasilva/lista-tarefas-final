import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `Adri<router-outlet></router-outlet>ano`,
})
export class AppComponent {
  title = 'lista-tarefas';
}
