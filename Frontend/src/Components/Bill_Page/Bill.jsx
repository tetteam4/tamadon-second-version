import React, { useEffect, useState } from "react";
import { FaTelegramPlane, FaEnvelope } from "react-icons/fa";
import { PiPhoneCallFill } from "react-icons/pi";
import { CiGlobe } from "react-icons/ci";
import { IoQrCode } from "react-icons/io5";
import bill from "../../../public/bill.jpeg";
import logo from "../../../public/Tamadon.png";
import axios from "axios";
import { FaMapMarkerAlt } from "react-icons/fa";
import CryptoJS from "crypto-js";
import moment from "moment-jalaali";
const Bill = ({ order }) => {
  const [categories, setCategories] = useState([]);
  const [attributes, setAttributes] = useState([order.attributes]);
  const [designers, setDesigners] = useState([]);
  const [prices, setPrices] = useState([]);
  const BASE_URL = import.meta.env.VITE_BASE_URL;
  const fetchPrices = async (orderId) => {
    try {
      // Get the email from localStorage
      const token = decryptData(localStorage.getItem("auth_token"));
      if (!token) {
        console.error("Token not found in localStorage");
        return;
      }

      // Make the API request
      const response = await axios.get(`${BASE_URL}/group/order-by-price/`, {
        params: { order: orderId },
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Use email in the header
        },
      });

      // Set the response data to the state
      setPrices(response.data);
      console.log(response.data);
    } catch (error) {
      console.error("Error fetching prices:", error);
    }
  };
  const formatToShamsi = (date) => {
    if (!date) return "";
    return moment(date).format("jYYYY/jMM/jDD"); // Shamsi format
  };
  useEffect(() => {
    if (order || order.id) {
      fetchPrices(order.id);
      // Fetch prices only when order.id is available
      console.log("Prices fetched for order:", order.id);
    }
  }, [order]); // Dependency array ensures it runs when `order` changes

  const getDesignerName = (designerId) => {
    const designer = designers.find((des) => des.id === designerId);
    return designer ? designer.first_name : "نامشخص";
  };

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

  const fetchDesigners = async () => {
    try {
      // Get the email from localStorage
      const token = decryptData(localStorage.getItem("auth_token"));
      if (!token) {
        console.error("Email not found in localStorage");
        return;
      }

      // Make the API request
      const response = await axios.get(`${BASE_URL}/users/api/users/`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Use email in the header
        },
      });

      // Set the response data to the state
      setDesigners(response.data);
    } catch (error) {
      console.error("Error fetching designers:", error);
    }
  };
  useEffect(() => {
    fetchDesigners();
  }, []); // Fetch data on component mount

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/group/categories/`);
        setCategories(response.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);
  return (
    <div className="bg-white border border-green ">
      <div className="flex justify-between items-center">
        <div className="w-full relative pr-5">
          {/* Backdrop image */}
          <img
            src={logo}
            alt="logo"
            className="absolute   opacity-5 top-20 -bottom-10 right-5 mt-5 w-[600px] object-cover overflow-hidden "
          />

          {/* Header */}

          <div>
            <div className=" flex  items-center justify-center">
              <div className="flex justify-center gap-x-2 items-center">
                <h2 className="text-5xl font-semibold text-left ">
                  <p>Tamadon</p>
                  <p>Printing Press</p>
                </h2>
                <h1 className="text-6xl  font-bold text-green-800 border-r-4  border-green pr-4">
                  مطبعـه تمدن
                </h1>
              </div>
            </div>
          </div>

          <div className="px-5 ">
            <div className="flex justify-between items-center h-full">
              {/* Persian Content */}
              <div className="text-right relative">
                <div className="text-green-700 flex-col">
                  <p className="absolute italic  -top-5 right-3 font-semibold">
                    بیش از
                  </p>
                  <span className="text-4xl italic  font-extrabold text-green mx-2">
                    20 سال
                  </span>
                  <p className="absolute right-3 italic font-semibold text-sm -bottom-6">
                    سابقه درخشان!
                  </p>
                </div>
              </div>

              {/* Center Content */}
              <div className="text-center">
                <p className="italic text-sm text-gray-900">
                  تلاقی کیفیت و نوآوری!
                </p>
                <p className="italic text-sm text-gray-800">
                  Intersection of Quality & Innovation
                </p>
              </div>

              {/* Logo */}
              <img
                src={logo}
                alt="Tamadon Logo"
                className="w-24 h-24 object-contain"
              />
            </div>
          </div>

          {/* contain */}

          <div className="flex justify-center mt-2 items-center ">
            <div className="border border-gray-400 h-[300px]  w-[800px]  rounded-lg bg-white grid overflow-hidden grid-cols-4  px-4 shadow-md">
              <div className="mt-5 col-span-1 ">
                <div className=" p-1 gap-x-2 flex items-start">
                  <p>مشتری:</p>
                  <span className=" underline">{order.customer_name}</span>
                </div>
                <div className=" p-1 gap-x-2 flex items-start">
                  <p>دیزاینر:</p>{" "}
                  <span className=" underline">
                    {getDesignerName(order.designer)}
                  </span>
                </div>
                <div className=" p-1 gap-x-2 flex items-start">
                  <p>نام سفارش:</p>{" "}
                  <span className=" underline">{order.order_name}</span>
                </div>
                <div className=" p-1 gap-x-2 flex items-start">
                  <p>جنس:</p>{" "}
                  <span className=" underline">
                    {categories.find(
                      (category) => category.id === order.category
                    )?.name || "نامشخص"}
                  </span>
                </div>
                <div className="p-1 gap-x-2 flex items-start">
                  <p>جمله :</p>
                  <span className="underline">
                    {prices[0]?.price || "unknown"}
                  </span>
                </div>
                <div className="p-1 gap-x-2 flex items-start">
                  <p>پیش پرداخت:</p>
                  <span className="underline">
                    {prices[0]?.receive_price || "unknown"}
                  </span>
                </div>
                <div className="p-1 gap-x-2 flex items-start">
                  <p>باقی :</p>
                  <span className="underline">
                    {prices[0]?.reminder_price || "unknown"}
                  </span>
                </div>
              </div>
              <div className=" col-span-3 grid grid-cols-3 mt-4">
                {order.attributes &&
                  Object.entries(order.attributes).map(
                    ([key, value], index) => (
                      <div
                        key={index}
                        className="flex justify-center items-center mb-3 gap-x-2 pb-2 last:border-b-0"
                      >
                        <span className="font-medium">{key}:</span>
                        <span>{value || "ندارد"}</span>
                      </div>
                    )
                  )}{" "}
              </div>
            </div>
          </div>
          <div className="flex items-center mt-6 px-8 justify-between  ">
            <div className="flex items-center justify-center gap-x-2 text-lg">
              <div className="flex items-center text-lg gap-x-1">
                <p>کد سفارش :</p>

                <p>{order.secret_key}</p>
              </div>
            </div>
            <div className="flex items-center text-lg gap-x-1">
              <p>تاریخ اخذ :</p>
              <p>{formatToShamsi(prices[0]?.created_at) || "unknown"}</p>
            </div>
            <div className="flex items-center gap-x-1">
              <p>تاریخ تحویل :</p>

              <p>{formatToShamsi(prices[0]?.delivery_date) || "unknown"}</p>
            </div>
          </div>
          {/*  */}
          <div>
            {/* Contact Section */}
            <footer className="py-2 font-bold flex px-8 justify-between items-center text-md text-gray-600 print:flex print:justify-between print:px-4">
              <div className="flex items-center justify-center gap-x-2 print:gap-x-1">
                <span>93-772-029-545+</span>
                <span className="bg-black p-1.5 rounded-full flex items-center justify-center w-8 h-8">
                  <PiPhoneCallFill className="text-white w-5 h-5" />
                </span>
              </div>
              <div className="flex items-center justify-center gap-x-2 print:gap-x-1">
                <span>tamadon.af@gmail.com</span>
                <span className="bg-black p-1.5 rounded-full flex items-center justify-center w-8 h-8">
                  <FaEnvelope className="text-white w-5 h-5" />
                </span>
              </div>
              <div className="flex items-center justify-center gap-x-2 print:gap-x-1">
                <span>@tamadon_press</span>
                <span className="bg-black p-1.5 rounded-full flex items-center justify-center w-8 h-8">
                  <FaTelegramPlane className="text-white w-5 h-5" />
                </span>
              </div>
            </footer>

            {/* Address & Website Section */}
            <div className="flex justify-evenly mt-3 items-center flex-wrap gap-4 print:gap-2">
              {/* Address Section */}
              <div className="flex items-center gap-2 align-middle print:inline-flex">
                <FaMapMarkerAlt className="text-[#d9534f] text-xl w-5 h-5" />
                <p className="text-gray-700 text-sm font-medium dark:text-gray-300 leading-none">
                  نشانی ما:
                </p>
                <p className="text-gray-700 text-sm font-medium dark:text-gray-300 text-right leading-none">
                  کوتة سنگی، سرک دهبوری، مارکیت اتفاق
                </p>
              </div>

              {/* Website Section */}
              <div className="flex items-center gap-2 align-middle print:inline-flex">
                <CiGlobe className="text-[#d9534f] text-xl w-5 h-5" />
                <p className="text-gray-800 text-sm font-medium dark:text-gray-300 leading-none">
                  نشانی ویب سایت ما:
                </p>
                <p className="text-gray-800 text-md font-medium dark:text-gray-300 text-right leading-none">
                  tamadonprintingpress.com
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="">
<<<<<<< Updated upstream
<<<<<<< Updated upstream
          <img src="/bill.jpeg" alt="" className="h-[190mm] w-[300px]" />
=======
          <img src={bill} alt="" className="h-full w-[300px]" />
>>>>>>> Stashed changes
=======
          <img src={bill} alt="" className="h-full w-[300px]" />
>>>>>>> Stashed changes
        </div>
      </div>
    </div>
  );
};

export default React.memo(Bill);
