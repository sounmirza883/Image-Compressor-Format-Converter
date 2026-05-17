export async function decodeAvif(buffer: ArrayBuffer): Promise<ImageData> {
  const { default: decode } = await import('@jsquash/avif/decode');
  return decode(buffer);
}

export async function encodeAvif(imageData: ImageData, quality: number): Promise<ArrayBuffer> {
  const { default: encode } = await import('@jsquash/avif/encode');
  // speed 8 = fast (lower quality), 4 = balanced
  return encode(imageData, { quality, speed: 6 });
}
