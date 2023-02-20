import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TextComponent } from '@demo/ng-lib/ui-text';
import { MyButtonComponent } from './components/my-button.component';

@Component({
  selector: 'app-root',
  template: `
    <my-button [text]="text"></my-button>
    <ui-text [(ngModel)]="text"></ui-text>
    {{ text }}
  `,
  standalone: true,
  imports: [TextComponent, MyButtonComponent, FormsModule]
})
export class AppComponent {
  text = 'Hello World!';
}
