import { v2 as cloudinary } from "cloudinary";

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

const isCloudinaryConfigured = !!(cloudName && apiKey && apiSecret);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });
}

export { cloudinary, isCloudinaryConfigured };

export async function uploadToCloudinary(
  buffer: Buffer,
  options: {
    folder: string;
    publicId?: string;
    resourceType?: "auto" | "raw" | "image" | "video";
    originalFilename: string;
  }
): Promise<{ secure_url: string; public_id: string; bytes: number }> {
  if (!isCloudinaryConfigured) {
    // Mock for dev without cloudinary - simulate upload
    const mockPublicId = `${options.folder}/${Date.now()}_${options.originalFilename}`;
    return {
      secure_url: `https://via.placeholder.com/800x600?text=${encodeURIComponent(options.originalFilename)}`,
      public_id: mockPublicId,
      bytes: buffer.length,
    };
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder,
        public_id: options.publicId,
        resource_type: options.resourceType || "auto",
        use_filename: true,
        unique_filename: true,
      },
      (error, result) => {
        if (error) return reject(error);
        if (!result) return reject(new Error("Cloudinary upload failed"));
        resolve({
          secure_url: result.secure_url,
          public_id: result.public_id,
          bytes: result.bytes,
        });
      }
    );
    uploadStream.end(buffer);
  });
}

export async function deleteFromCloudinary(publicId: string, resourceType: string = "auto"): Promise<boolean> {
  if (!isCloudinaryConfigured) {
    return true; // mock success
  }
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType as any,
    });
    return result.result === "ok" || result.result === "not found";
  } catch (e) {
    console.error("Cloudinary delete error:", e);
    return false;
  }
}

export function getCloudinaryFolderPath(dept: string, year: string, section: string, subject: string): string {
  const sanitize = (s: string) => s.replace(/[^a-zA-Z0-9-_]/g, "_");
  return `ClassShare/${sanitize(dept)}/${sanitize(year)}/${sanitize(section)}/${sanitize(subject)}`;
}

export function getFileTypeFromName(fileName: string): string {
  const ext = fileName.split(".").pop()?.toLowerCase() || "unknown";
  return ext;
}

export function getResourceType(fileType: string): "raw" | "image" | "auto" {
  const imageTypes = ["jpg", "jpeg", "png", "gif", "webp"];
  if (imageTypes.includes(fileType.toLowerCase())) return "image";
  return "raw";
}
