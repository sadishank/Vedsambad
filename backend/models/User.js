import mongoose from "mongoose";
import cloudinary from "../lib/cloudinary.js";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    profilePic: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Use findOneAndDelete instead of deleteOne
userSchema.pre("findOneAndDelete", async function (next) {
  try {
    const user = await this.model.findOne(this.getQuery());

    if (user && user.profilePic) {
      // Extract public ID from Cloudinary URL
      const publicId = user.profilePic.split("/").pop().split(".")[0];

      // Delete from Cloudinary
      await cloudinary.uploader.destroy(publicId);
    }
    next();
  } catch (error) {
    console.error("Error in user pre-delete hook:", error);
    next(error);
  }
});

const User = mongoose.model("User", userSchema);

export default User;
