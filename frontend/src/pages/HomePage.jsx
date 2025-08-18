import React, { useContext, useState } from "react";
import Sidebar from "../components/Sidebar";
import ChatContainer from "../components/ChatContainer";
import { ChatContext } from "../../context/ChatContext";

const HomePage = () => {
  const { selectedUser } = useContext(ChatContext);

  return (
    <div className="border w-full h-screen sm:px-[15%] sm:py-[5%]">
      <div
        className={`backdrop-blur-sm border-2 border-gray-600 rounded-2x1 overflow-hidden h-[100%] grid grid-cols-1 relative ${
          selectedUser ? "md:grid-cols-[1fr_2fr]" : "md:grid-cols-2"
        }`}
      >
        <Sidebar />
        <ChatContainer />
      </div>
    </div>
  );
};

export default HomePage;
