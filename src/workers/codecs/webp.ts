export async function decodeWebp(buffer: ArrayBuffer): Promise<ImageData> {
  const { default: decode } = await import('@jsquash/webp/decode');
  return decode(buffer);
}

export async function encodeWebp(imageData: ImageData, quality: number): Promise<ArrayBuffer> {
  const { default: encode } = await import('@jsquash/webp/encode');
  return encode(imageData, { quality });
}
