import Message from "../models/Message.js";
import User from "../models/User.js";
import cloudinary from "../lib/cloudinary.js";
import { io, userSocketMap } from "../server.js";

// get all user except logged in user
export const getUsersForSidebar = async (req, res) => {
  try {
    const userId = req.user._id;
    const filteredUsers = await User.find({ _id: { $ne: userId } }).select(
      "-password"
    );

    // count unseen messages for each user
    const unseenMessages = {};
    const promises = filteredUsers.map(async (user) => {
      const messages = await Message.find({
        senderId: user._id,
        receiverId: userId,
        seen: false,
      });
      if (messages.length > 0) {
        unseenMessages[user._id] = messages.length;
      }
    });
    await Promise.all(promises);
    res.json({
      success: true,
      users: filteredUsers,
      unseenMessages,
    });
  } catch (error) {
    console.error("Error in getUsersForSidebar:", error.message); // Changed to console.error
    res.status(500).json({
      // Use 500 for server errors
      success: false,
      message: "Server error fetching users",
      error: error.message,
    });
  }
};

// get all messages fot selected user
export const getMessages = async (req, res) => {
  try {
    const { id: selectedUserId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: selectedUserId },
        { senderId: selectedUserId, receiverId: myId },
      ],
    })
      .populate("senderId", "fullName profilePic")
      .sort({ createdAt: 1 });

    await Message.updateMany(
      { senderId: selectedUserId, receiverId: myId, seen: false },
      { seen: true }
    );
    res.json({
      success: true,
      messages,
    });
  } catch (error) {
    console.error("Error in getMessages:", error.message); // Changed to console.error
    res
      .status(500)
      .json({
        success: false,
        message: "Server error fetching messages",
        error: error.message,
      }); // Use 500
  }
};

// api to mark message as seen
export const markMessageAsSeen = async (req, res) => {
  try {
    const { id } = req.params;
    const message = await Message.findByIdAndUpdate(id, { seen: true });
    if (!message) {
      return res
        .status(404)
        .json({ success: false, message: "Message not found" });
    }
    res.json({
      success: true,
      message: "Message marked as seen",
    });
  } catch (error) {
    console.error("Error in markMessageAsSeen:", error.message); // Changed to console.error
    res
      .status(500)
      .json({
        success: false,
        message: "Server error marking message as seen",
        error: error.message,
      }); // Use 500
  }
};

// send messages to the selected user
export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const receiverId = req.params.id;
    const senderId = req.user._id;

    let imageUrl;
    if (image) {
      try {
        const upload = await cloudinary.uploader.upload(image, {
          folder: "chat_images", // Optional: Organize uploads in a specific folder
          // You can add more options like quality, format, transformations here
        });
        imageUrl = upload.secure_url;
      } catch (uploadError) {
        console.error("Cloudinary Image Upload Failed:", uploadError); // More specific error message
        return res.status(500).json({
          success: false,
          message: "Failed to upload image. Please try again later.",
          error: uploadError.message, // Send back the error message for debugging
        });
      }
    }

    // Input validation: Ensure at least text or an image is provided
    if (!text && !imageUrl) {
      return res.status(400).json({
        success: false,
        message: "Cannot send empty message. Please provide text or an image.",
      });
    }

    const newMessage = await Message.create({
      senderId,
      receiverId,
      text,
      image: imageUrl, // Will be undefined if no image was uploaded
    });

    const populatedMessage = await Message.findById(newMessage._id)
      .populate("senderId", "fullName profilePic")
      .lean(); // Use lean() for better performance

    // Emit to both users
    const receiverSocketId = userSocketMap[receiverId];
    const senderSocketId = userSocketMap[senderId];

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", populatedMessage);
    }

    // Only emit to sender if they are not the receiver (to avoid duplicate display from socket and optimistic update)
    // If the sender is also the receiver (e.g., sending a message to self for testing),
    // the optimistic update already handled it, and the socket might cause a duplicate.
    if (senderSocketId && senderId.toString() !== receiverId.toString()) {
      io.to(senderSocketId).emit("newMessage", populatedMessage);
    }

    res.status(201).json({
      // Use 201 Created for successful resource creation
      success: true,
      newMessage: populatedMessage,
    });
  } catch (error) {
    console.error("Server Error in sendMessage:", error); // General server error
    res.status(500).json({
      success: false,
      message: "An internal server error occurred while sending the message.",
      error: error.message,
    });
  }
};
