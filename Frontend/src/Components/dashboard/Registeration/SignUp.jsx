import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserPlus } from "react-icons/fa";
import { FaUser } from "react-icons/fa";
import axios from "axios";
import CryptoJS from "crypto-js";
const BASE_URL = import.meta.env.VITE_BASE_URL;

const SignUp = () => {
  const secretKey = "TET4-1"; // Use a strong secret key
  const decryptData = (hashedData) => {
    if (!hashedData) {
      console.error("No data to decrypt");
      return null;
    }
    try {
      const bytes = CryptoJS.AES.decrypt(hashedData, secretKey);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      return JSON.parse(decrypted);
    } catch (error) {
      console.error("Decryption failed:", error);
      return null;
    }
  };
  const navigate = useNavigate();
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const [message, setMessage] = useState();
  const [user, setUser] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    phoneNumber: "",
    role: "",
    password: "",
    passwordConfirm: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const roles = [
    { id: 1, name: "Designer" },
    { id: 2, name: "Reception" },
    { id: 3, name: "SuperDesigner" },
    { id: 4, name: "Printer" },
  ];
  const [selectedRole, setSelectedRole] = useState(user.role || "");

  const handleSelect = (role) => {
    setSelectedRole(role);
    setIsSelectOpen(false);
    handleChange({ target: { name: "role", value: role.id } });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prevUser) => ({
      ...prevUser,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (user.password !== user.passwordConfirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError("");
    const token = decryptData(localStorage.getItem("auth_token"));
    if (!token) {
      console.error("No authentication token found in localStorage.");
      return;
    }
    try {
      const headers = {
        Authorization: `Bearer ${token}`, // Add the Authorization header
        "Content-Type": "application/json", // Ensure the content type is set
      };
      const storedEmail = decryptData(localStorage.getItem("email"));

      const response = await axios.post(
        `${BASE_URL}/users/create/`,
        {
          first_name: user.firstName,
          last_name: user.lastName,
          username: user.username,
          email: user.email,
          phone_number: user.phoneNumber,
          role: user.role,
          password: user.password,
          password_confirm: user.passwordConfirm,
        },
        { headers }
      );

      const data = await response.data;
      if (response.status == 201) {
        setMessage(
          "کاربر گرامی، حساب شما با موفقیت ایجاد شد! لطفاً ایمیل خود را بررسی کنید تا حساب‌تان را فعال کنید. ✅📩"
        );
        setUser({
          firstName: "",
          lastName: "",
          username: "",
          email: "",
          phoneNumber: "",
          role: "",
          password: "",
          passwordConfirm: "",
        });
      } else {
        throw new Error(response.data.message || "خطا در ثبت کاربر");
      }
      // Handle success (optional)
      console.log("User created successfully:", data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError("");
      }, 5000);
      return () => clearTimeout(timer);
    }
    if (message) {
      const timer = setTimeout(() => {
        setMessage("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, message]);
  return (
    <div className="flex justify-center  items-center  mt-10">
      <div className="w-full max-w-lg lg:max-w-3xl bg-white  p-3 rounded-lg shadow-lg border  border-gray-300">
        <div className="flex items-center justify-center gap-x-2 text-center mb-6">
          <p className="text-xl font-semibold text-center">کاربر جدید</p>
          <FaUser size={22} />
        </div>
        {error && <div className="text-red-500 text-center mb-4">{error}</div>}
        {message && (
          <div className="text-green-500 text-center mb-4">{message}</div>
        )}

        <form onSubmit={handleSubmit} className=" space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* First Name */}
            <div>
              <label
                htmlFor="firstName"
                className="block font-medium mb-1 mr-1"
              >
                نام
              </label>
              <input
                placeholder="نام"
                type="text"
                name="firstName"
                id="firstName"
                value={user.firstName}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 bg-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2  focus:ring-green"
                required
              />
            </div>

            {/* Last Name */}
            <div>
              <label htmlFor="lastName" className="block font-medium mb-1 mr-1">
                تخلص
              </label>
              <input
                placeholder="تخلص"
                type="text"
                name="lastName"
                id="lastName"
                value={user.lastName}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 bg-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green"
                required
              />
            </div>

            {/* Username */}
            <div>
              <label htmlFor="username" className="block font-medium mb-1 mr-1">
                نام کاربری
              </label>
              <input
                placeholder="نام کاربری"
                type="text"
                name="username"
                id="username"
                value={user.username}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 bg-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block font-medium mb-1 mr-1">
                ایمیل
              </label>
              <input
                placeholder="ایمیل"
                type="email"
                name="email"
                id="email"
                value={user.email}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 bg-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green"
                required
              />
            </div>

            {/* Phone Number */}
            <div>
              <label
                htmlFor="phoneNumber"
                className="block font-medium mb-1 mr-1"
              >
                نمبر تلفن
              </label>
              <input
                placeholder="نمبر تلفن"
                type="text"
                name="phoneNumber"
                id="phoneNumber"
                value={user.phoneNumber}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 bg-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green"
              />
            </div>

            {/* Role */}
            <div className=" text-black w-full">
              <label htmlFor="role" className="block font-medium mb-1 mr-1">
                وظیفه
              </label>
              <div className="relative bg-white text-gray-800">
                {/* Selected Role */}
                <div
                  className="w-full p-2 border border-gray-300 bg-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green"
                  onClick={() => setIsSelectOpen(!isSelectOpen)}
                >
                  {selectedRole ? selectedRole.name : "انتخاب Role"}
                </div>

                {/* Dropdown List */}
                {isSelectOpen && (
                  <ul className="absolute w-full bg-white border border-gray-300  shadow-lg mt-1 z-10">
                    
                    {roles.map((role) => (
                      <li
                        key={role.id}
                        className="p-3 text-black hover:bg-gray-100 border-b cursor-pointer"
                        onClick={() => handleSelect(role)}
                      >
                        {role.name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block font-medium mb-1 mr-1">
                رمز
              </label>
              <input
                placeholder="رمز"
                type="password"
                name="password"
                id="password"
                value={user.password}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 bg-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green"
                required
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="passwordConfirm"
                className="block font-medium mb-1 mr-1"
              >
                تأیید رمز
              </label>
              <input
                placeholder="تأیید رمز"
                type="password"
                name="passwordConfirm"
                id="passwordConfirm"
                value={user.passwordConfirm}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 bg-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green"
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center pt-2 ">
            <button
              type="submit"
              className="w-full md:w-auto secondry-btn"
              disabled={loading}
            >
              {loading ? "در حال ثبت کردن... " : "ثبت کردن"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
