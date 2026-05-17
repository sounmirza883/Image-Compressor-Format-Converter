export async function decodePng(buffer: ArrayBuffer): Promise<ImageData> {
  const { default: decode } = await import('@jsquash/png/decode');
  return decode(buffer);
}

export async function encodePng(imageData: ImageData): Promise<ArrayBuffer> {
  const { default: encode } = await import('@jsquash/png/encode');
  return encode(imageData);
}
