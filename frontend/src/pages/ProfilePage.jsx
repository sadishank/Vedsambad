import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

const ProfilePage = () => {
  const { authUser, updateProfile } = useContext(AuthContext);
  const [selectedImg, setSelectedImg] = useState(null);
  const navigate = useNavigate();
  const [name, setName] = useState(authUser.fullName);
  const [bio, setBio] = useState(authUser.bio);
  const { deleteAccount } = useContext(AuthContext);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let base64Image = null;

      if (selectedImg) {
        base64Image = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.readAsDataURL(selectedImg);
          reader.onload = () => resolve(reader.result);
        });
      }

      await updateProfile({
        fullName: name,
        bio,
        ...(base64Image && { profilePic: base64Image }),
      });

      navigate("/");
    } catch (error) {
      // Error is already displayed by updateProfile
      console.error("Profile update failed:", error);
    }
  };

  const handleDeleteAccount = async () => {
    if (
      !window.confirm(
        "Are you sure? This will permanently delete your account and all your data!"
      )
    ) {
      return;
    }

    setIsDeleting(true);
    try {
      const success = await deleteAccount();
      if (success) {
        navigate("/login");
      }
    } catch (error) {
      console.error("Delete account failed:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-cover bg-no-repeat flex items-center justify-center backdrop-blur-sm">
      <div className="bg-white/10 backdrop-blur-2xl rounded-lg shadow-lg w-5/6 max-w-2xl text-gray-300 border-2 border-gray-600 flex justify-between items-center max-sm:flex-col-reverse">
        {/* -----------------left---------------- */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-5 p-10 flex-1"
        >
          <h3 className="text-lg">Profile Details</h3>
          <label
            htmlFor="avatar"
            className="flex items-center gap-3 cursor-pointer"
          >
            <input
              onChange={(e) => setSelectedImg(e.target.files[0])}
              type="file"
              id="avatar"
              accept=".png, .jpg, .jpeg"
              hidden
            />
            <img
              src={
                selectedImg
                  ? URL.createObjectURL(selectedImg)
                  : "./assets/images/avatarIcon.png"
              }
              className={`w-12 h-12 ${selectedImg} {/* && "rounded-full"} */} rounded-full`}
            />
            Upload Profile Picture
          </label>
          <input
            onChange={(e) => setName(e.target.value)}
            value={name}
            type="text"
            placeholder="Your name"
            className="p-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
            required
          />
          <textarea
            onChange={(e) => setBio(e.target.value)}
            value={bio}
            placeholder="Write profile bio"
            required
            className="p-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
            rows={4}
          ></textarea>
          <button
            type="submit"
            className="bg-gradient-to-r from-[#C0353A] to-[#24366A] text-white p-2 rounded-full hover:opacity-90 transition-opacity mx-10 max-sm:mt-10"
          >
            Save Profile
          </button>
          <div className="mt-8">
            <button
              onClick={handleDeleteAccount}
              disabled={isDeleting}
              className="w-full py-3 bg-[#C0353A] text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {isDeleting ? "Deleting Account..." : "Delete My Account"}
            </button>
            <p
              className="text-xs mt-2 text-center"
              style={{ color: "#C0353A" }}
            >
              Warning: This will permanently delete your account and all your
              messages.
            </p>
          </div>
        </form>

        {/* -----------------right---------------- */}
        <img
          src={authUser?.profilePic || "./assets/images/logo.png"}
          className={`max-w-44 aspect-square rounded-full mx-10 max-sm:mt-10 ${
            selectedImg && "rounded-full"
          }`}
        />
      </div>
    </div>
  );
};

export default ProfilePage;
