/**
 * Client-side image compression utility
 * Compresses images in the browser to max 800px dimension and under 150 KB
 * Stored as a base64 Data URL directly inside Firestore documents.
 */
export async function compressImage(file: File, maxDim: number = 800, maxBytes: number = 150 * 1024): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      return reject(new Error('File yang dipilih bukan gambar valid.'));
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let { width, height } = img;

      // Scale down so neither dimension exceeds maxDim
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return reject(new Error('Gagal menginisialisasi canvas.'));
      }

      // Draw with smoothing
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      // Binary search / iterative quality adjustment to stay strictly under maxBytes
      let quality = 0.82;
      let dataUrl = canvas.toDataURL('image/jpeg', quality);

      // Base64 size estimation in bytes: length * (3/4) - padding
      const calcBytes = (str: string) => Math.round((str.length * 3) / 4);

      while (calcBytes(dataUrl) > maxBytes && quality > 0.25) {
        quality -= 0.12;
        dataUrl = canvas.toDataURL('image/jpeg', quality);
      }

      resolve(dataUrl);
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Gagal memproses gambar. Format mungkin tidak didukung.'));
    };

    img.src = objectUrl;
  });
}

/**
 * Avatar square compressor (256x256 centered crop, under 60KB)
 */
export async function compressAvatar(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      return reject(new Error('File yang dipilih bukan gambar.'));
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const minDim = Math.min(img.width, img.height);
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 256;

      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas error'));

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(
        img,
        (img.width - minDim) / 2,
        (img.height - minDim) / 2,
        minDim,
        minDim,
        0,
        0,
        256,
        256
      );

      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      resolve(dataUrl);
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Gagal memuat foto profil.'));
    };

    img.src = objectUrl;
  });
}
