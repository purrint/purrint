export async function renderImage(
  file: File,
  previewCanvas: HTMLCanvasElement
): Promise<ImageData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const newWidth = 384;
        const newHeight = Math.floor(img.height * (newWidth / img.width));

        previewCanvas.width = newWidth;
        previewCanvas.height = newHeight;

        const ctx = previewCanvas.getContext("2d", {
          willReadFrequently: true,
        })!;

        ctx.drawImage(img, 0, 0, newWidth, newHeight);

        // Atkinson dithering
        const imageData = ctx.getImageData(0, 0, newWidth, newHeight);
        const data = imageData.data;
        const grayscale = new Float32Array(newWidth * newHeight);

        for (let i = 0; i < data.length; i += 4) {
          grayscale[i / 4] = (data[i] + data[i + 1] + data[i + 2]) / 3;
        }

        for (let y = 0; y < newHeight; y++) {
          for (let x = 0; x < newWidth; x++) {
            const index = y * newWidth + x;
            const oldPixel = grayscale[index];
            const newPixel = oldPixel > 128 ? 255 : 0;
            grayscale[index] = newPixel;
            const error = (oldPixel - newPixel) / 8;

            if (x + 1 < newWidth) {
              grayscale[index + 1] += error;
            }
            if (x + 2 < newWidth) {
              grayscale[index + 2] += error;
            }
            if (x - 1 >= 0 && y + 1 < newHeight) {
              grayscale[index - 1 + newWidth] += error;
            }
            if (y + 1 < newHeight) {
              grayscale[index + newWidth] += error;
            }
            if (x + 1 < newWidth && y + 1 < newHeight) {
              grayscale[index + 1 + newWidth] += error;
            }
            if (y + 2 < newHeight) {
              grayscale[index + newWidth * 2] += error;
            }
          }
        }

        for (let i = 0; i < data.length; i += 4) {
          const color = grayscale[i / 4];
          data[i] = color;
          data[i + 1] = color;
          data[i + 2] = color;
        }

        ctx.putImageData(imageData, 0, 0);
        resolve(imageData);
      };
      img.onerror = reject;
      img.src = event.target!.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
