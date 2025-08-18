import React, { useContext, useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { ChatContext } from "../../context/ChatContext";

const Sidebar = () => {
  const {
    getUsers,
    users,
    setSelectedUser,
    selectedUser,
    unseenMessages,
    setUnseenMessages,
  } = useContext(ChatContext);
  const { logout, onlineUsers } = useContext(AuthContext);
  const [input, setInput] = useState("");
  const [showMenu, setShowMenu] = useState(false); // State for menu visibility
  const navigate = useNavigate();
  const filteredUsers = input
    ? users.filter((user) =>
        user.fullName.toLowerCase().includes(input.toLowerCase())
      )
    : users;

  useEffect(() => {
    getUsers();
  }, [onlineUsers]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (showMenu) setShowMenu(false);
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [showMenu]);

  return (
    <div
      className={`bg-[#8185B2]/10 h-full p-5 flex flex-col rounded-r-xl overflow-y-scroll text-white ${
        selectedUser ? "max-md:hidden" : ""
      }`}
    >
{/* first ko only padding */}
      <div className="pb-5 flex-shrink-0"> 
        <div className="flex justify-between items-center">
          <img src="./assets/images/logo.png" alt="logo" className="max-w-25" />
          <div className="relative py-2">
            <img
              src="./assets/images/menuIcon.png"
              alt="Menu"
              className="max-h-7 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
            />
            {showMenu && (
              <div className="absolute top-full right-0 z-20 w-32 p-5 rounded-md bg-[#282142] border-gray-600 text-gray-100">
                <p
                  onClick={() => navigate("/profile")}
                  className="cursor-pointer text-sm"
                >
                  Edit Profile
                </p>
                <hr className="my-2 border-t border-gray-500" />
                <p onClick={() => logout()} className="cursor-pointer text-sm">
                  LogOut
                </p>
                
              </div>
            )}
          </div>
        </div>
        <div className="bg-[#20376E] rounded-full flex items-center gap-2 py-3 px-4 mt-5">
          <img
            src="./assets/images/searchIcon.png"
            alt="Search"
            className="w-3"
          />
          <input
            onChange={(e) => setInput(e.target.value)}
            type="text"
            className="bg-transparent border-none outline-none text-white text-xs placeholder-[#c8c8c8] flex-1"
            placeholder="Search User.."
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2">
        {filteredUsers.map((user, index) => (
          <div
            key={user._id || index}
            onClick={() => {
              setSelectedUser(user);
              setUnseenMessages((prev) => ({
                ...prev,
                [user._id]: 0,
              }));
            }}
            className={`relative flex items-center gap-2 p-2 pl-1 rounded cursor-pointer max-sm:text-sm ${
              selectedUser?._id === user._id ? "bg-blue-600/50" : ""
            }`}
          >
            <img
              src={user?.profilePic || "./assets/images/avatarIcon.png"}
              alt=""
              className="w-[35px] aspect-[1/1] rounded-full"
            />
            <div className="flex flex-col leading-5">
              <p>{user.fullName}</p>
              {onlineUsers.includes(user._id) ? (
                <span className="text-green-400 text-xs">Online</span>
              ) : (
                <span className="text-rose-600 text-xs">Offline</span>
              )}
            </div>
            {(unseenMessages[user._id] || 0) > 0 && (
              <p className="absolute top-4 right-4 text-xs h-5 w-5 flex justify-center items-center rounded-full bg-blue-500/50">
                {unseenMessages[user._id]}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
