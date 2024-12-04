// import multer from "multer";
// import { NextApiRequest, NextApiResponse } from "next";
// import path from "path";
// import fs from "fs";

// // Helper function to handle middleware execution
// function runMiddleware(req: NextApiRequest & { [key: string]: any }, res: NextApiResponse, fn: (...args: any[]) => void): Promise<any> {
//     return new Promise((resolve, reject) => {
//         fn(req, res, (result: any) => {
//             if (result instanceof Error) {
//                 return reject(result);
//             }

//             return resolve(result);
//         });
//     });
// }

// // Next.js API route configuration to disable default body parsing (for multer to work)
// export const config = {
//     api: {
//         bodyParser: false, // Disable body parser so multer can handle the request
//     },
// };

// const handler = async (req: NextApiRequest & { [key: string]: any }, res: NextApiResponse): Promise<void> => {
//     if (req.method !== "POST") {
//         // Reject methods other than POST
//         return res.status(405).json({ message: "Method Not Allowed" });
//     }

//     // Set up multer storage configuration for file uploads
//     const multerStorage = multer.diskStorage({
//         destination: (req, file, cb) => {
//             const uploadDir = path.join(process.cwd(), "public", "uploads"); // Define the folder for saving uploaded files
//             fs.mkdirSync(uploadDir, { recursive: true }); // Ensure the directory exists
//             cb(null, uploadDir); // Save the file to the uploads folder
//         },
//         filename: (req, file, cb) => {
//             const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9); // Create a unique filename
//             cb(null, uniqueSuffix + path.extname(file.originalname)); // Save the file with the generated name
//         },
//     });

//     const multerUpload = multer({ storage: multerStorage });

//     try {
//         // Run multer middleware to handle file upload
//         await runMiddleware(req, res, multerUpload.single("image")); // 'image' is the form field name for the uploaded file

//         const file = req.file; // Access the uploaded file
//         if (!file) {
//             return res.status(400).json({ message: "No file uploaded" });
//         }

//         // Return the file path of the saved image
//         const filePath = `/uploads/${file.filename}`; // Path relative to the 'public' directory
//         return res.status(200).json({ message: "Image uploaded successfully", filePath: filePath });
//     } catch (error) {
//         console.error("Error uploading image:", error);
//         return res.status(500).json({ message: "Error uploading image" });
//     }
// };

// export default handler;
import { NextResponse } from "next/server";
import cloudinary from "@/libs/cloudinary";
import User from "@/models/users.model";
import { connect } from "@/database/db";

connect();

interface UploadImageResponse {
    url: string;
}
async function UploadImage(file: { arrayBuffer: () => any }, folder: string) {
    const buffer = await file.arrayBuffer();
    const bytes = Buffer.from(buffer);
    console.log("hio");
    return new Promise(async (resolve, reject) => {
        await cloudinary.uploader
            .upload_stream(
                {
                    resource_type: "auto",
                    folder: folder,
                },
                async (err, result) => {
                    if (err) {
                        return reject(err.message);
                    }
                    return resolve(result);
                },
            )
            .end(bytes);
    });
}
export async function POST(req: { formData: () => Promise<FormData> }) {
    try {
        const formData = await req.formData();
        const image = formData.get("image") as File | null;
        const userId = formData.get("user_id") as string | null;

        if (!image || !userId) {
            return NextResponse.json({ error: "Image or user_id is missing." }, { status: 400 });
        }

        const data = await UploadImage(image, "images");
        console.log(data.url);
        console.log(userId);
        // Update the user with the new image URL in the wasteDumped array

        const fetchedUser = await User.findById(userId);
        console.log(fetchedUser);

        await User.findByIdAndUpdate(
            userId,
            {
                $push: { wasteDumped: data.url },
                $inc: {
                    totalPointsEarned: 10,
                },
            },
            { new: true },
        );

        console.log("The user table has another waste dump recorded");

        return NextResponse.json(data.url, { status: 200 });
    } catch (error) {
        console.error("Error uploading image:", error);
        return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
    }
}
