import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadFile(
  file: Buffer,
  options: {
    folder: string;
    filename?: string;
    resourceType?: "image" | "raw" | "auto";
  }
) {
  return new Promise<{ url: string; publicId: string; bytes: number }>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `hrms/${options.folder}`,
        public_id: options.filename,
        resource_type: options.resourceType ?? "auto",
      },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error("Upload failed"));
          return;
        }
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          bytes: result.bytes,
        });
      }
    );
    uploadStream.end(file);
  });
}

export async function deleteFile(publicId: string) {
  return cloudinary.uploader.destroy(publicId);
}

export { cloudinary };
