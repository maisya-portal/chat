/**
 * Client-Side Image Compressor using HTML5 Canvas API
 * Resizes and compresses image to reduce payload size before sending to Google Apps Script / Drive
 */

export interface CompressionResult {
  base64: string;
  originalSize: number;
  compressedSize: number;
  width: number;
  height: number;
}

export async function compressImage(
  file: File,
  maxWidth = 1280,
  maxHeight = 1280,
  quality = 0.8
): Promise<CompressionResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target?.result as string;

      img.onload = () => {
        let { width, height } = img;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Gagal mendapatkan 2D canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Convert to high-efficiency JPEG data URL
        const base64 = canvas.toDataURL('image/jpeg', quality);
        const head = 'data:image/jpeg;base64,';
        const compressedSize = Math.round(((base64.length - head.length) * 3) / 4);

        resolve({
          base64,
          originalSize: file.size,
          compressedSize,
          width,
          height
        });
      };

      img.onerror = () => reject(new Error('Gagal memuat elemen gambar'));
    };

    reader.onerror = () => reject(new Error('Gagal membaca file gambar'));
  });
}
