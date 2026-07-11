import cloudinary from "../configs/cloudinary.js";

const uploadToCloudinary = async (fileBuffer) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          resource_type: "raw",
          folder: "InterviewAceAI/resumes",
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        },
      )
      .end(fileBuffer);
  });
};
const deleteFromCloudinary = async (publicId) => {
  return await cloudinary.uploader.destroy(publicId, {
    resource_type: "raw",
  });
};

export default uploadToCloudinary;
export { deleteFromCloudinary };
