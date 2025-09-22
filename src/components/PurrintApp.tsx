import { useState, useRef, useEffect } from "react";
import { renderImage } from "../services/render.ts";
import { printImage } from "../services/printer.ts";
import icon from "../assets/icon.svg";

export default function PurrintApp() {
  const previewCanvas = useRef<HTMLCanvasElement>(null);
  const imageInput = useRef<HTMLInputElement>(null);

  const [imageData, setImageData] = useState<ImageData>();
  const [isBluetoothAvailable] = useState("bluetooth" in navigator);

  function handleFile(file: File) {
    if (!previewCanvas.current) {
      return;
    }
    renderImage(file, previewCanvas.current)
      .then((imageData) => {
        setImageData(imageData);
      })
      .catch((error) => {
        console.error("Rendering failed:", error);
        alert("Rendering failed. See console for details.");
      });
  }

  function onImageInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (event.target.files?.length) {
      handleFile(event.target.files[0]);
    }
  }

  function onDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    if (event.dataTransfer?.files.length) {
      handleFile(event.dataTransfer.files[0]);
    }
  }

  useEffect(() => {
    function onPaste(event: ClipboardEvent) {
      for (const item of Array.from(event.clipboardData?.items ?? [])) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) {
            handleFile(file);
            return;
          }
        }
      }
    }
    window.addEventListener("paste", onPaste);
    return () => {
      window.removeEventListener("paste", onPaste);
    };
  }, []);

  function onPrintClick() {
    if (!imageData) {
      alert("Please select an image first.");
      return;
    }

    printImage(imageData).catch((error) => {
      console.error("Printing failed:", error);
      alert("Printing failed. See console for details.");
    });
  }

  return (
    <>
      <img
        src={icon}
        className="mascot shadow"
        alt="PURRINT"
        height="150"
        width="150"
      />

      {!isBluetoothAvailable && (
        <div className="compatibility-notice">
          Bluetooth is not available in this browser.<br />Try a Chrome-based
          browser instead.
        </div>
      )}

      <div className="receipt">
        <div
          id="preview-container"
          className={imageData ? "has-image" : ""}
          onClick={() => imageInput.current?.click()}
          onDrop={onDrop}
        >
          <div id="preview-text">
            Select image<br />(or paste or drop here)
          </div>
          <canvas id="preview" ref={previewCanvas}></canvas>
        </div>
      </div>

      <input
        type="file"
        id="image-input"
        accept="image/*"
        style={{ display: "none" }}
        ref={imageInput}
        onChange={onImageInputChange}
      />
      <button
        id="print-button"
        onClick={onPrintClick}
        disabled={!isBluetoothAvailable}
      >
        PURRINT!
      </button>
    </>
  );
}
