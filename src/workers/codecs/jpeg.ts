export async function decodeJpeg(buffer: ArrayBuffer): Promise<ImageData> {
  const { default: decode } = await import('@jsquash/jpeg/decode');
  return decode(buffer);
}

export async function encodeJpeg(imageData: ImageData, quality: number): Promise<ArrayBuffer> {
  const { default: encode } = await import('@jsquash/jpeg/encode');
  return encode(imageData, { quality });
}
