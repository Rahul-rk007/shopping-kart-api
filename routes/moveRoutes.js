const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router(); // Create a new router

// Define the source and destination directories
console.log(__dirname);

const baseDir = path.dirname(__dirname); // Get the parent directory of the current file
const sourceDir = path.join(baseDir, "uploads", "products"); // Correctly point to uploads/products
const destinationDir = path.join(baseDir, "uploads", "products"); // Same for destination

// Log the source directory path for debugging
console.log("Source Directory:", sourceDir);

// Function to move files from dynamic folders to the main products folder
const moveFilesToProductsFolder = (req, res) => {
  // Check if the source directory exists
  if (!fs.existsSync(sourceDir)) {
    console.error("Source directory does not exist:", sourceDir);
    return res.status(404).json({ message: "Source directory does not exist" });
  }

  // Read the source directory
  fs.readdir(sourceDir, (err, folders) => {
    if (err) {
      console.error("Error reading source directory:", err);
      return res
        .status(500)
        .json({ message: "Error reading source directory" });
    }

    // If no folders found, return a message
    if (folders.length === 0) {
      return res.status(200).json({ message: "No folders to process" });
    }

    // Iterate over each folder in the source directory
    folders.forEach((folder) => {
      const folderPath = path.join(sourceDir, folder);

      // Check if the current item is a directory
      fs.stat(folderPath, (err, stats) => {
        if (err) {
          console.error("Error getting stats for folder:", err);
          return res
            .status(500)
            .json({ message: "Error getting folder stats" });
        }

        if (stats.isDirectory()) {
          // Read the contents of the folder
          fs.readdir(folderPath, (err, files) => {
            if (err) {
              console.error("Error reading folder:", err);
              return res.status(500).json({ message: "Error reading folder" });
            }

            // Move each file to the destination directory
            files.forEach((file) => {
              const oldPath = path.join(folderPath, file);
              const newPath = path.join(destinationDir, file);

              // Move the file
              fs.rename(oldPath, newPath, (err) => {
                if (err) {
                  console.error(`Error moving file ${file}:`, err);
                } else {
                  console.log(`Moved file ${file} to ${destinationDir}`);
                }
              });
            });
          });
        }
      });
    });

    // Send a response after processing
    res.status(200).json({ message: "Files moved successfully" });
  });
};

// Define a route to trigger the file moving
router.get("/move-files", moveFilesToProductsFolder); // Call the function on this route

module.exports = router; // Export the router
