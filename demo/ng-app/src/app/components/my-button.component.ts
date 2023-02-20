import { Component } from "@angular/core";
import { ButtonComponent } from "@demo/ng-lib/ui-button";

@Component({
    selector: "my-button",
    standalone: true,
    template: `{{ text }}`,
    imports: [ButtonComponent]
})
export class MyButtonComponent extends ButtonComponent {
}