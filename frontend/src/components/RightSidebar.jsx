import React, { useState, useEffect, useContext } from "react";
import { ChatContext } from "../../context/ChatContext";
import { AuthContext } from "../../context/AuthContext";

const RightSidebar = () => {
  const { selectedUser, messages } = useContext(ChatContext);
  const { logout, onlineUsers } = useContext(AuthContext);
  const [msgImages, setMsgImages] = useState([]);

  useEffect(() => {
    setMsgImages(messages.filter((msg) => msg.image).map((msg) => msg.image));
  }, [messages]);

  return (
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
              <div
                key={index}
                onClick={() => window.open(url)}
                className="cursor-pointer rounded"
              >
                <img src={url} className="h-full rounded-md" />
              </div>
            ))}
          </div>
        </div>
        <button
          onClick={() => logout()}
          className="absolute bottom-5 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-[#C0353A] to-[#24366A] text-white border-none text-sm font-light px-20 py-2 rounded-full cursor-pointer"
        >
          LogOut
        </button>
      </div>
    )
  );
};

export default RightSidebar;
