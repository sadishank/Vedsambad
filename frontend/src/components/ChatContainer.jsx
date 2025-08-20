import React, { useContext, useEffect, useRef, useState } from "react";
import { formatMessageTime } from "../lib/utils";
import { ChatContext } from "../../context/ChatContext";
import { AuthContext } from "../../context/AuthContext";
import toast from "react-hot-toast";
import RightSidebar from "./RightSidebar";

const ChatContainer = () => {
  const {
    messages,
    selectedUser,
    setSelectedUser,
    sendMessage,
    getMessages,
    isSending,
  } = useContext(ChatContext);
  const { authUser, onlineUsers } = useContext(AuthContext);
  const scrollEnd = useRef();
  const [input, setInput] = useState("");
  const [showRightSidebar, setShowRightSidebar] = useState(false);

  // Close sidebar when user changes
  useEffect(() => {
    setShowRightSidebar(false);
  }, [selectedUser]);

  // handle sending message
  const handleSendMessage = async (e) => {
    if (input.trim() === "" || isSending) return;
    const messageText = input.trim();
    setInput("");
    sendMessage({ text: messageText });

    setShouldAutoScroll(true);
  };
  const handleSendImage = async (e) => {
    if (isSending) return;
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/")) {
      toast.error("Please select a valid image file.");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = async () => {
      await sendMessage({ image: reader.result });
      e.target.value = "";
    };
    reader.readAsDataURL(file);
  }; useEffect(() => {
    if (selectedUser) {
      getMessages(selectedUser._id);
    }
  }, [selectedUser]);

  useEffect(() => {
    if (scrollEnd.current && messages) {
      scrollEnd.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return selectedUser ? (
    <div className="h-full overflow-hidden relative backdrop-blur-lg flex">
      {/* Main Chat Area */}
      <div
        className={`flex-1 flex flex-col h-full ${
          showRightSidebar ? "max-md:w-full" : "w-full"
        }`}
      >
        {/* ----------------header--------------- */}
        <div className="flex items-center gap-3 py-3 mx-4 border-b border-stone-500">
          <img
            src={selectedUser.profilePic || "./assets/images/avatarIcon.png"}
            alt=""
            className="w-8 rounded-full"
          />
          <p className="flex-1 text-lg text-white flex items-center gap-2">
            {selectedUser.fullName}
            <span
              className={`w-3 h-3 rounded-full ${
                onlineUsers.includes(selectedUser._id)
                  ? "bg-green-400"
                  : "bg-red-500"
              }`}
            ></span>
          </p>
          <img
            onClick={() => setSelectedUser(null)}
            src="./assets/images/arrowIcon.png"
            alt=""
            className="md:hidden max-w-7 cursor-pointer"
          />
