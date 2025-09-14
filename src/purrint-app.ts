import { LitElement, css, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { renderImage } from "./render.ts";
import { printImage } from "./printer.ts";

@customElement("purrint-app")
export class PurrintApp extends LitElement {
  @state()
  private imageData?: ImageData;

  @state()
  private dragOver = false;

  private handleFile(file: File) {
    const previewCanvas = this.shadowRoot!.getElementById(
      "preview"
    ) as HTMLCanvasElement;
    renderImage(file, previewCanvas)
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

  private onPreviewClick() {
    this.shadowRoot!.getElementById("image-input")!.click();
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

  render() {
    return html`
      <div class="header">
        <h1>PURRINT</h1>
        <div class="mascot">≽^•⩊•^≼</div>
      </div>

      <div class="receipt">
        <div
          id="preview-container"
          class=${this.imageData ? "has-image" : ""}
          @click=${this.onPreviewClick}
          @dragenter=${this.onDragEnter}
          @dragover=${this.onDragOver}
          @dragleave=${this.onDragLeave}
          @drop=${this.onDrop}
        >
          <div id="preview-text" style=${this.imageData ? "display: none" : ""}>
            Click to select image<br />(or drop here)
          </div>
          <canvas
            id="preview"
            style=${this.imageData ? "display: block" : ""}
          ></canvas>
        </div>
      </div>

      <input
        type="file"
        id="image-input"
        accept="image/*"
        style="display: none;"
        @change=${this.onImageInputChange}
      />
      <button id="print-button" @click=${this.onPrintClick}>PRINT!</button>
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
      font-size: 32px;
      margin-top: 5px;
    }
    .receipt {
      background-color: #fff;
      width: 100%;
      max-width: 384px;
      box-sizing: border-box;
      box-shadow: 0 10px 20px rgba(0, 0, 0, 0.19), 0 6px 6px rgba(0, 0, 0, 0.23);
      padding: 20px;
      margin-bottom: 40px;
    }
    #preview-container {
      min-height: 100px;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      box-sizing: border-box;
      background-color: #fff;
      border: 2px dashed #000;
    }
    #preview-container.has-image {
      border-color: transparent;
    }
    #preview-container.drag-over {
      border-style: dashed;
      border-color: #000;
    }
    #preview-text {
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
      font-family: "Noto Sans Mono", monospace;
      background-color: #000;
      color: #fff;
      border: none;
      padding: 15px 20px;
      cursor: pointer;
      font-size: 18px;
      letter-spacing: 2px;
    }
    button:hover {
      opacity: 0.8;
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
