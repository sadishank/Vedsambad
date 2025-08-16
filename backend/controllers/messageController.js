import React, { useState, useEffect, useContext } from "react";
import { ChatContext } from "../../context/ChatContext";
import { AuthContext } from "../../context/AuthContext";

const RightSidebar = () => {
  const { selectedUser, messages } = useContext(ChatContext);
  const { logout, onlineUsers } = useContext(AuthContext);
  const [msgImages, setMsgImages] = useState([]);

  useEffect(() => {
    setMsgImages(messages.filter((msg) => msg.image).map((msg) => msg.image));
  }, [messages]); return (
    selectedUser && (
      <div className="bg-[#8581B2]/10 text-white w-80 h-full relative overflow-y-scroll">
        <div className="pt-16 flex flex-col items-center gap-2 text-xs font-light mx-auto">
          <img
            src={selectedUser?.profilePic || "./assets/images/avatarIcon.png"}
            className="w-20 aspecr-[1/1] rounded-full"
          />
          <h1 className="px-10 font-medium text-xl mx-auto flex items-center gap-2">
            {onlineUsers.includes(selectedUser._id) && (
              <p className="w-3 h-3 rounded-full bg-green-400"></p>
            )}
            {selectedUser.fullName}
          </h1>
          <p className="px-10 mx-auto">{selectedUser.bio}</p>
        </div>
        <hr className="bg-[#ffffff50] my-4" />
        <div className="px-5 text-xs">
          <p>Media</p>
          <div className="mt-2 max-h-[300px] overflow-y-scroll grid grid-cols-2 gap-4 opacity-80">
            {msgImages.map((url, index) => (
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



