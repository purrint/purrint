import { LitElement, css, html } from "lit";
import { customElement, query, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { renderImage } from "../services/render.ts";
import { printImage } from "../services/printer.ts";
import icon from "../assets/icon.svg";

@customElement("purrint-app")
export class PurrintApp extends LitElement {
  @query("#preview") private previewCanvas!: HTMLCanvasElement;
  @query("#image-input") private imageInput!: HTMLInputElement;

  @state()
  private imageData?: ImageData;

  @state()
  private dragOver = false;

  private handleFile(file: File) {
    renderImage(file, this.previewCanvas)
      .then((imageData) => {
        this.imageData = imageData;
      })
      .catch((error) => {
        console.error("Rendering failed:", error);
        alert("Rendering failed. See console for details.");
      });
  }

  private onImageInputChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.handleFile(input.files[0]);
    }
  }

  private onDragEnter(event: DragEvent) {
    event.preventDefault();
    this.dragOver = true;
  }

  private onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  private onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.dragOver = false;
  }

  private onDrop(event: DragEvent) {
    event.preventDefault();
    this.dragOver = false;
    if (event.dataTransfer?.files.length) {
      this.handleFile(event.dataTransfer.files[0]);
    }
  }

  private onPaste(event: ClipboardEvent) {
    for (const item of Array.from(event.clipboardData?.items ?? [])) {
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) {
          this.handleFile(file);
          return;
        }
      }
    }
  };

  private onPrintClick() {
    if (!this.imageData) {
      alert("Please select an image first.");
      return;
    }

    printImage(this.imageData).catch((error) => {
      console.error("Printing failed:", error);
      alert("Printing failed. See console for details.");
    });
  }

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener("paste", this.onPaste);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener("paste", this.onPaste);
  }

  render() {
    return html`
      <div class="header">
        <img
          src=${icon}
          class="mascot shadow"
          alt="PURRINT"
          height="150"
          width="150"
        />
      </div>

      <div class="receipt">
        <div
          id="preview-container"
          class=${classMap({
            "has-image": !!this.imageData,
            "drag-over": this.dragOver,
          })}
          @click=${() => this.imageInput.click()}
          @dragenter=${this.onDragEnter}
          @dragover=${this.onDragOver}
          @dragleave=${this.onDragLeave}
          @drop=${this.onDrop}
        >
          <div id="preview-text">
            Select image<br />(or paste or drop here)
          </div>
          <canvas id="preview"></canvas>
        </div>
      </div>

      <input
        type="file"
        id="image-input"
        accept="image/*"
        style="display: none;"
        @change=${this.onImageInputChange}
      />
      <button id="print-button" @click=${this.onPrintClick}>PURRINT!</button>
    `;
  }

  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      margin: 0;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
    }
    h1 {
      font-size: 48px;
      margin: 0;
    }
    .mascot {
      margin-top: 5px;
      filter: drop-shadow(6px 6px rgba(0, 0, 0, 0.4));
    }
    .receipt {
      background-color: #fff;
      width: 100%;
      max-width: 384px;
      box-sizing: border-box;
      padding: 20px;
      margin-bottom: 40px;
      border: 6px solid #000;
      filter: drop-shadow(6px 6px rgba(0, 0, 0, 0.4));
    }
    #preview-container {
      min-height: 100px;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      box-sizing: border-box;
      background-color: #fff;
      border: 6px dashed #000;
    }
    #preview-container.has-image {
      border-color: transparent;
    }
    #preview-container.drag-over {
      border-style: dashed;
      border-color: #000;
    }
    #preview-text {
      font-size: 18px;
      text-align: center;
      color: #000;
      width: 100%;
      pointer-events: none;
    }
    #preview {
      max-width: 100%;
      display: none;
      pointer-events: none;
    }
    #preview-container.has-image #preview {
      display: block;
    }
    #preview-container.has-image #preview-text {
      display: none;
    }
    button {
      font-family: "Tiny5", monospace;
      background-color: #000;
      color: #fff;
      border: none;
      padding: 12px 18px;
      cursor: pointer;
      font-size: 24px;
      letter-spacing: 2px;
      filter: drop-shadow(6px 6px rgba(0, 0, 0, 0.4));
    }
    button:hover {
      filter: drop-shadow(3px 3px rgba(0, 0, 0, 0.4));
      translate: 3px 3px;
    }
    input[type="file"] {
      display: none;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "purrint-app": PurrintApp;
  }
}
