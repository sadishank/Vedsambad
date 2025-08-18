import axios from "axios";
import { createContext, useState, useEffect } from "react";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const backendUrl = import.meta.env.VITE_BACKEND_URL;
axios.defaults.baseURL = backendUrl;

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [authUser, setAuthUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [socket, setSocket] = useState(null);

  // check if the user is authenticated and if so, set the user data and connect to the socket
  const checkAuth = async () => {
    try {
      const { data } = await axios.get("/api/auth/check");
      if (data.success) {
        setAuthUser(data.user);
        connectSocket(data.user);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  //   login function to authenticate the user and socket connection
  const login = async (state, credentials) => {
    try {
      const { data } = await axios.post(`/api/auth/${state}`, credentials);
      if (data.success) {
        setAuthUser(data.userData);
        connectSocket(data.userData);
        axios.defaults.headers.common["token"] = data.token;
        setToken(data.token);
        localStorage.setItem("token", data.token);
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // logout function to clear user data and disconnect socket
  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setAuthUser(null);
    setOnlineUsers([]);
    axios.defaults.headers.common["token"] = null;
    toast.success("Logged out successfully");
    socket.disconnect();
  };

  // update user profile function
  const updateProfile = async (body) => {
    try {
      const { data } = await axios.put("/api/auth/update-profile", body);
      if (data.success) {
        setAuthUser(data.user);
        toast.success("Profile updated successfully");
        return true;
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      // Get proper error message from response
      const errorMsg = error.response?.data?.message || error.message;
      toast.error(errorMsg);
      throw error; // Rethrow for component handling
    }
  };

  // delete user profile 
  const deleteAccount = async () => {
  try {
    const { data } = await axios.delete('/api/auth/delete-account');
    if (data.success) {
      // Clear all user data
      localStorage.removeItem("token");
      setToken(null);
      setAuthUser(null);
      setOnlineUsers([]);
      
      // Disconnect socket
      if (socket) {
        socket.disconnect();
      }
      
      toast.success(data.message);
      return true;
    }
  } catch (error) {
    const errorMsg = error.response?.data?.message || error.message;
    toast.error(errorMsg);
    throw error;
  }
};

  // connect to the socket server
  const connectSocket = (userData) => {
    if (!userData || socket?.connected) return;
    const newSocket = io(backendUrl, {
      query: { userId: userData._id },
    });
    newSocket.connect();
    setSocket(newSocket);

    newSocket.on("getOnlineUsers", (userIds) => {
      setOnlineUsers(userIds);
    });
  };

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["token"] = token;
    }
    checkAuth();
  }, []);

  const value = {
    axios,
    authUser,
    onlineUsers,
    socket,
    login,
    logout,
    updateProfile,
    deleteAccount
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
