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
          /> <img
            onClick={() => setShowRightSidebar(!showRightSidebar)}
            src="./assets/images/infoIcon.png"
            alt="Toggle sidebar"
            className="max-md:hidden max-w-5 cursor-pointer"
          />
        </div>
        {/* -------------chat area--------------- */}
        <div className="flex flex-col flex-1 overflow-y-scroll p-3">
          {messages.map((msg) => {
            // Guard against undefined messages
            if (!msg || !msg.senderId) return null;

            // Handle both string and object formats for senderId
            const senderId =
              typeof msg.senderId === "string"
                ? msg.senderId
                : msg.senderId._id;

            const isCurrentUser = senderId === authUser._id;

            const senderProfile = isCurrentUser
              ? authUser?.profilePic || "./assets/images/avatarIcon.png"
              : selectedUser?.profilePic || "./assets/images/avatarIcon.png";

            return (
              <div
                key={msg._id}
                className={`flex items-end gap-2 ${
                  isCurrentUser ? "justify-end" : "justify-start"
                }`}
              >
                {/* Sender info (left side) */}
                {!isCurrentUser && (
                  <div className="text-center text-xs">
                    <img
                      src={senderProfile}
                      alt="sender"
                      className="w-7 rounded-full"
                    />
                    <p className="text-gray-500">
                      {formatMessageTime(msg.createdAt)}
                    </p>
                  </div>
                )}

                {/* Message content */}
                {msg.image ? (
                  <img
                    src={msg.image}
                    alt="message content"
                    className="max-w-[230px] border border-gray-700 rounded-lg overflow-hidden mb-8"
                  />
                ) : (
                  <p
                    className={`p-2 max-w-[200px] md:text-sm font-light rounded-lg mb-8 break-all text-white ${
                      isCurrentUser
                        ? "bg-violet-500/30 rounded-br-none"
                        : "bg-gray-600 rounded-bl-none"
                    }`}
                  >
                    {msg.text}
                  </p>
                )}

                {/* Current user info (right side) */}
                {isCurrentUser && (
                  <div className="text-center text-xs">
                    <img
                      src={senderProfile}
                      alt="sender"
                      className="w-7 rounded-full"
                    />
                    <p className="text-gray-500">
                      {formatMessageTime(msg.createdAt)}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
          <div ref={scrollEnd} />
        </div>
        {/* --------------footer------------- */}
        <div className="flex items-center gap-3 p-3">
          <div className="flex-1 flex items-center bg-gray-500 px-3 rounded-full">
            <input
              onChange={(e) => setInput(e.target.value)}
              value={input}
              onKeyDown={(e) =>
                e.key === "Enter" ? handleSendMessage(e) : null
              }
              type="text"
              className="flex-1 text-sm p-3 text-white border-none placeholder-gray-200 rounded-lg outline-none"
              placeholder="Message.."
            />
            <input
              onChange={handleSendImage}
              type="file"
              id="images"
              accept="image/jpeg, image/png"
              hidden
            />
            <label htmlFor="images">
              <img
                src="./assets/images/linkIcon.png"
                className="w-5 mr-2 cursor-pointer"
              />
            </label>
          </div>
          <button
            onClick={handleSendMessage}
            disabled={input.trim() === ""}
            className={`p-3 rounded-full ${
              input.trim() === ""
                ? "opacity-50 cursor-not-allowed"
                : "cursor-pointer"
            }`}
          ><img src="./assets/images/sendIcon.png" className="w-7" />
          </button>
        </div>
      </div>

      {/* Conditionally rendered RightSidebar */}
      {showRightSidebar && <RightSidebar />}
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center gap-2 text-gray-500 bg-white/10 max-md:hidden">
      <img src="./assets/images/logo.png" className="max-w-16" />
      <p className="text-lg font=medium text-white"> Chat anytime, anywhere</p>
    </div>
  );
};



