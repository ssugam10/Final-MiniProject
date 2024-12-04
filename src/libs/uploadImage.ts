import cloudinary from "./cloudinary";

// Define a custom type for the upload response
interface CloudinaryUploadResponse {
    secure_url: string;
    [key: string]: any; // Allow additional properties
}

// Define a custom type for the error response
interface CloudinaryUploadError {
    message: string;
    [key: string]: any; // Allow additional properties
}

/**
 * Uploads a base64 image string to Cloudinary.
 * @param base64Image - The base64 image string (data URL format).
 * @param folder - The folder in Cloudinary where the image will be uploaded.
 * @returns A promise resolving to the Cloudinary upload response.
 */
export async function UploadImage(base64Image: string, folder: string): Promise<CloudinaryUploadResponse> {
    return new Promise((resolve, reject) => {
        const formatMatch = base64Image.match(/^data:(image\/(\w+));base64,/);
        if (!formatMatch) {
            return reject("Invalid image format. Ensure the image is in base64 format.");
        }

        const imageData = base64Image.replace(formatMatch[0], ""); // Remove the data URL prefix
        const mimeType = formatMatch[1]; // Extract the MIME type

        cloudinary.uploader.upload(`data:${mimeType};base64,${imageData}`, { resource_type: "image", folder }, (err: CloudinaryUploadError | undefined, result: CloudinaryUploadResponse | undefined) => {
            if (err) {
                return reject(err.message || "Unknown error occurred during upload.");
            }
            if (result) {
                return resolve(result);
            }
            return reject("Upload failed without error information.");
        });
    });
}
