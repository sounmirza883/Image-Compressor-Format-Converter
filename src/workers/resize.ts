export function resizeImageData(
  imageData: ImageData,
  maxWidth?: number,
  maxHeight?: number,
  lockAspectRatio = true
): ImageData {
  let { width, height } = imageData;

  if (!maxWidth && !maxHeight) return imageData;

  if (maxWidth && width > maxWidth) {
    if (lockAspectRatio) height = Math.round((height * maxWidth) / width);
    width = maxWidth;
  }

  if (maxHeight && height > maxHeight) {
    if (lockAspectRatio) width = Math.round((width * maxHeight) / height);
    height = maxHeight;
  }

  if (width === imageData.width && height === imageData.height) return imageData;

  const src = new OffscreenCanvas(imageData.width, imageData.height);
  const srcCtx = src.getContext('2d')!;
  srcCtx.putImageData(imageData, 0, 0);

  const dst = new OffscreenCanvas(width, height);
  const dstCtx = dst.getContext('2d')!;
  dstCtx.imageSmoothingEnabled = true;
  dstCtx.imageSmoothingQuality = 'high';
  dstCtx.drawImage(src, 0, 0, width, height);

  return dstCtx.getImageData(0, 0, width, height);
}
