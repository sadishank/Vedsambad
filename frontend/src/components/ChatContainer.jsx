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
  };