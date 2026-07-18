import QRCode from "qrcode";

export async function generateQRDataUrl(text: string): Promise<string> {
  try {
    return await QRCode.toDataURL(text, {
      width: 400,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
    });
  } catch (e) {
    console.error("QR generation failed", e);
    return "";
  }
}
