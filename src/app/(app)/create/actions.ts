'use server';

import fs from "fs";
import path from "path";

export async function uploadPhoto(formData: FormData): Promise<{ url?: string; error?: string }> {
  try {
    const file = formData.get("imageFile") as File;
    const userId = formData.get("userId") as string;

    if (!file) return { error: "No file provided" };
    if (!userId) return { error: "No user ID provided." };


    const buffer = Buffer.from(await file.arrayBuffer());
    
    // In a real VPS environment, you would use a path like this.
    // For this example, we'll simulate it by writing to the public directory.
    const relativeUploadDir = "/uploads";
    const uploadDir = path.join(process.cwd(), "public", relativeUploadDir);

    // Ensure folder exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    const uniqueFilename = `${Date.now()}-${file.name}`;
    const uploadPath = path.join(uploadDir, uniqueFilename);

    fs.writeFileSync(uploadPath, buffer);

    const publicUrl = `https://onlycreation.in/uploads/${uniqueFilename}`;

    return { url: publicUrl };

  } catch (e: any) {
    console.error("Upload Error:", e);
    return { error: e.message };
  }
}
