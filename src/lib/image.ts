/**
 * Сжимает выбранную фотографию перед загрузкой в Supabase Storage —
 * уменьшаем до maxWidth и пережимаем в JPEG, чтобы фото с телефона
 * (обычно несколько МБ) не грузилось слишком долго.
 */
export function resizeImageToBlob(file: File, maxWidth = 800, quality = 0.8): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error("Не удалось прочитать файл"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Не удалось открыть изображение"));
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Браузер не поддерживает обработку изображений"));
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          (blob) => (blob ? resolve(blob) : reject(new Error("Не удалось сохранить изображение"))),
          "image/jpeg",
          quality
        );
      };
      img.src = reader.result as string;
    };

    reader.readAsDataURL(file);
  });
}
