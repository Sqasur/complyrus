// this file is responsible for handling docx/pdf/xlsx file uploads to the server
// and storing them in a temporary folder
import multer from "multer";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/temp"); // Set the destination folder for uploaded files
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }, // Set the filename to the current timestamp and original name
});

export const upload = multer({
  storage: storage,
});
