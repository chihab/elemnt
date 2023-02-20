import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("ui-button")
export class Button extends LitElement {
  @property({ type: String })
  text: string = '';

  protected render() {
    return html`<button>${this.text}</button>`
  }
}
