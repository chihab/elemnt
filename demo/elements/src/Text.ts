import { html, LitElement } from "lit";
import { property, customElement } from "lit/decorators.js";

@customElement("ui-text")
export class Text extends LitElement {
    @property({ type: String })
    value: string = '';

    protected render() {
        return html`Text: <input @input=${this.onInput} .value="${this.value}"/>`
    }

    protected onInput(event: any) {
        this.value = event.target.value;
    }
}