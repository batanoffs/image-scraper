/**
 * Download Images Module
 *
 * @module downloadImages.ts
 * @description This module is responsible downloading images from URLs and save them locally.
 * @param imageUrls Array of image URLs to download
 */

//Imports
import axios from "axios";
import fs from "fs";
import path from "path";

// Function that downloads images from the URLs
export default async function downloadImages(imageUrls: string[]): Promise<void> {

    // Create images directory if it doesn't exist
    const imagesDir = path.join(process.cwd(), "images");

    //Try to download the image
    try {

        // Check if the directory exists
        if (!fs.existsSync(imagesDir)) {

            // If not - Create the directory
            fs.mkdirSync(imagesDir);
        } else {
            // Read all files in the directory
            const files = fs.readdirSync(imagesDir);

            // Delete each file
            for (const file of files) {

                // Get the file path
                const filePath = path.join(imagesDir, file);

                // Delete the file
                fs.unlinkSync(filePath);

            }
            
            // Log the success
            console.log(`Successfully cleared ${files.length} images`);
        }

        // Iterate over the image URLs
        for (const [index, url] of imageUrls.entries()) {

                // Get the image data
                const response = await axios.get(url, { responseType: "stream" });

                // Check if the response is successful
                if(response.status !== 200) {

                    // Log the failure
                    console.log(`Failed to download image: ${url}`);

                    // Continue to the next image
                    continue;
                };

                // Generate unique filename using timestamp and index
                const timestamp = Date.now();
                const extension = path.extname(url) || ".jpg";
                const filename = `image_${timestamp}_${index}${extension}`;
                const filepath = path.join(imagesDir, filename);

                // Create write stream and pipe the image data to it
                const writer = fs.createWriteStream(filepath);

                // Pipe the image data to the writer
                response.data.pipe(writer);

                // Handle completion through promise
                await new Promise<void>((resolve, reject) => {
                    writer.on("finish", () => resolve());
                    writer.on("error", reject);
                });

                // Log the success
                console.log(`Successfully downloaded image: ${filename}`);

        } 
    }

    // Catch errors
    catch (error) {

        console.log('Error downloading images:', error);
        
        // throw the error
        throw error;
    }
}
