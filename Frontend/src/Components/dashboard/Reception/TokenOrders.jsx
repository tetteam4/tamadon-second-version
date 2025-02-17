import React, { useEffect, useState } from "react";
import axios from "axios";
import jwt_decode from "jwt-decode";
import ReactDOM from "react-dom";
import Bill from "../../Bill_Page/Bill";
import { IoSearch } from "react-icons/io5";
import SearchBar from "./searchRecords";
import { FaArrowRightLong } from "react-icons/fa6";
import CryptoJS from "crypto-js";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import vazirmatnFont from "/vazirmatnBase64.txt"; // Ensure this is a valid Base64 font

const BASE_URL = import.meta.env.VITE_BASE_URL;

const TokenOrders = () => {
  const [searchResults, setSearchResults] = useState([]); // State to hold search results
  const [orders, setOrders] = useState([]);

  const [passedOrder, setPassedOrder] = useState([]);
  const [isModelOpen, setIsModelOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [designers, setDesigners] = useState([]);
  const [prices, setPrices] = useState({});
  const [receivedPrices, setReceivedPrices] = useState({});
  const [remaindedPrices, setRemaindedPrices] = useState({});
  const [DDate, setDDate] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedAttribute, setSelectedAttribute] = useState([]); // State for popup data
  const [selectedStatus, setSelectedStatus] = useState({}); // State for popup data
  const [visibleCount, setVisibleCount] = useState(10); // Initial visible items

  const showMore = () => {
    setVisibleCount((prev) => prev + 10); // Show 10 more items
  };

  const showLess = () => {
    setVisibleCount(10); // Reset to 10 items
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

  const printBill = async () => {
    const element = document.getElementById("bill-content");

    if (!element) {
      console.error("Bill content not found!");
      return;
    }

    try {
      // Create jsPDF instance
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: [350, 500],
      });

      // Load and set Vazirmatn font
      pdf.addFileToVFS("Vazirmatn.ttf", vazirmatnFont);
      pdf.addFont("vazirmatn.ttf", "vazirmatn", "normal");
      pdf.setFont("vazirmatn");

      // Capture the element as a high-quality image
      const canvas = await html2canvas(element, {
        scale: 2, // Reduced scale for smaller image size
        useCORS: true, // Fixes CORS issues if images are external
      });

      // Convert canvas to image with lower quality and JPEG format
      const imgData = canvas.toDataURL("image/jpeg", 0.5); // Reduce quality to 50%

      // Calculate image dimensions to fit the PDF
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width; // Maintain aspect ratio

      // Add the image to the PDF
      pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);

      // Save the PDF file with compression
      pdf.save("bill.pdf", { compress: true });
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  const getAuthToken = () => decryptData(localStorage.getItem("auth_token"));

  const isTokenExpired = (token) => {
    const decoded = jwt_decode(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  };

  const refreshAuthToken = async () => {
    try {
      const response = await axios.post(
        `${BASE_URL}/users/user/token/refresh/`
      );
      const newAuthToken = response.data.access;
      decryptData(localStorage.setItem("auth_token", newAuthToken));
      return newAuthToken;
    } catch (error) {
      console.error("Unable to refresh token", error);
      return null;
    }
  };

  const fetchData = async () => {
    let token = getAuthToken();

    if (!token) {
      console.error("No authentication token found.");
      setLoading(false);
      return;
    }

    if (isTokenExpired(token)) {
      token = await refreshAuthToken();
      if (!token) {
        console.error("Unable to refresh token.");
        setLoading(false);
        return;
      }
    }

    try {
      const [ordersResponse, categoriesResponse, usersResponse] =
        await Promise.all([
          axios.get(`${BASE_URL}/group/order/`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${BASE_URL}/group/categories/`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${BASE_URL}/users/api/users/`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

      setOrders(ordersResponse.data);
      setCategories(categoriesResponse.data);
      setDesigners(usersResponse.data);

      const newPrices = {};
      const newReceived = {};
      const newRemainded = {};
      const newDeliveryDate = {};

      await Promise.all(
        ordersResponse.data.map(async (order) => {
          try {
            const priceResponse = await axios.get(
              `${BASE_URL}/group/order-by-price/`,
              { params: { order: order.id } }
            );

            const data1 = priceResponse.data;

            // Check if data1 exists and is not empty before accessing its properties
            if (data1 && data1.length > 0) {
              newPrices[order.id] = data1[0].price;
              newReceived[order.id] = data1[0].receive_price;
              newRemainded[order.id] = data1[0].reminder_price;
              newDeliveryDate[order.id] = data1[0].delivery_date;
            } else {
              console.warn(`No price data found for order ID: ${order.id}`);
            }
          } catch (priceError) {
            console.error(
              `Error fetching price for order ID: ${order.id}`,
              priceError
            );
          }
        })
      );

      // Merge new data with existing state
      setPrices((prevPrices) => ({ ...prevPrices, ...newPrices }));
      setReceivedPrices((prevReceived) => ({
        ...prevReceived,
        ...newReceived,
      }));
      setRemaindedPrices((prevRemainded) => ({
        ...prevRemainded,
        ...newRemainded,
      }));
      setDDate((prevDDate) => ({ ...prevDDate, ...newDeliveryDate }));
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // const intervalId = setInterval(() => {
    //   fetchData();
    // }, 2000);
    // return () => clearInterval(intervalId);
  }, []);

  const getCategoryName = (categoryId) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category ? category.name : "نامشخص";
  };

  const getDesignerName = (designerId) => {
    const designer = designers.find((des) => des.id === designerId);
    return designer ? designer.first_name : "نامشخص";
  };

  const handleShowAttribute = (order, status) => {
    // Convert JSON object to an array

    // Update state
    setPassedOrder(order);
    setSelectedStatus(status);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="mt-8 px-10 ">
      <h2 className="md:text-2xl text-base text-center font-Ray_black font-bold mb-4">
        لیست سفارشات گرفته شده
      </h2>
      <SearchBar setSearchResults={setSearchResults} />

      <center>
        <div className="overflow-x-scroll w-[420px] md:w-full rounded-lg">
          <table className="w-full  rounded-lg border  border-gray-300 shadow-md">
            <thead className=" ">
              <tr className="bg-green text-gray-100 text-center">
                <th className="border border-gray-300 px-6 py-2.5  font-semibold text-sm md:text-base">
                  نام مشتری
                </th>
                <th className="border border-gray-300 px-6 py-2.5 tfont-semibold text-sm md:text-base">
                  نام سفارش
                </th>
                <th className="border border-gray-300 px-6 py-2.5  font-semibold text-sm md:text-base">
                  دسته‌بندی
                </th>
                <th className="border border-gray-300 px-6 py-2.5  font-semibold text-sm md:text-base">
                  دیزاینر
                </th>
                <th className="border border-gray-300 px-6 py-2.5  font-semibold text-sm md:text-base">
                  قیمت کل
                </th>
                <th className="border border-gray-300 px-6 py-2.5  font-semibold text-sm md:text-base">
                  قیمت دریافت شده
                </th>
                <th className="border border-gray-300 px-6 py-2.5  font-semibold text-sm md:text-base">
                  قیمت باقی‌مانده
                </th>
                <th className="border border-gray-300 px-6 py-2.5  font-semibold text-sm md:text-base">
                  تاریخ تحویل
                </th>
                <th className="border border-gray-300 px-6 py-2.5  font-semibold text-sm md:text-base">
                  جزئیات
                </th>
              </tr>
            </thead>
            <tbody className="">
              {searchResults.length > 0 ? (
                searchResults.map((order) => (
                  <tr
                    key={order.id}
                    className="text-center font-bold border-b border-gray-200 bg-white hover:bg-gray-200 transition-all"
                  >
                    <td className="border-gray-300 px-6 py-2 text-gray-700 text-sm md:text-base">
                      {order.customer_name || "در حال بارگذاری..."}
                    </td>
                    <td className="border-gray-300 px-6 py-2 text-gray-700 text-sm md:text-base">
                      {order.order_name || "در حال بارگذاری..."}
                    </td>
                    <td className="border-gray-300 px-6 py-2 text-gray-700 text-sm md:text-base">
                      {getCategoryName(order.category) || "در حال بارگذاری..."}
                    </td>
                    <td className="border-gray-300 px-6 py-2 text-gray-700 text-sm md:text-base">
                      {getDesignerName(order.designer) || "در حال بارگذاری..."}
                    </td>
                    <td className="border-gray-300 px-6 py-2 text-gray-700 text-sm md:text-base">
                      {prices[order.id] || "در حال بارگذاری..."}
                    </td>
                    <td className="border-gray-300 px-6 py-2 text-gray-700 text-sm md:text-base">
                      {receivedPrices[order.id] || "در حال بارگذاری..."}
                    </td>
                    <td className="border-gray-300 px-6 py-2 text-gray-700 text-sm md:text-base">
                      {remaindedPrices[order.id] || "در حال بارگذاری..."}
                    </td>
                    <td className="border-gray-300 px-6 py-2 text-gray-700 text-sm md:text-base">
                      {DDate[order.id] || "در حال بارگذاری..."}
                    </td>
                    <td className="border-gray-300 px-6 py-2 text-gray-700 text-sm md:text-base">
                      <button
                        onClick={() => {
                          handleShowAttribute(order, order.status);
                          setIsModelOpen(true);
                        }}
                        className="secondry-btn"
                      >
                        نمایش
                      </button>
                    </td>
                  </tr>
                ))
              ) : orders.length > 0 ? (
                orders.slice(0, visibleCount).map((order) => (
                  <tr
                    key={order.id}
                    className="text-center font-bold border-b border-gray-200 bg-white hover:bg-gray-200 transition-all"
                  >
                    <td className="border-gray-300 px-6 py-2 text-gray-700 text-sm md:text-base">
                      {order.customer_name || "در حال بارگذاری..."}
                    </td>
                    <td className="border-gray-300 px-6 py-2 text-gray-700 text-sm md:text-base">
                      {order.order_name || "در حال بارگذاری..."}
                    </td>
                    <td className="border-gray-300 px-6 py-2 text-gray-700 text-sm md:text-base">
                      {getCategoryName(order.category) || "در حال بارگذاری..."}
                    </td>
                    <td className="border-gray-300 px-6 py-2 text-gray-700 text-sm md:text-base">
                      {getDesignerName(order.designer) || "در حال بارگذاری..."}
                    </td>
                    <td className="border-gray-300 px-6 py-2 text-gray-700 text-sm md:text-base">
                      {prices[order.id] || "در حال بارگذاری..."}
                    </td>
                    <td className="border-gray-300 px-6 py-2 text-gray-700 text-sm md:text-base">
                      {receivedPrices[order.id] || "در حال بارگذاری..."}
                    </td>
                    <td className="border-gray-300 px-6 py-2 text-gray-700 text-sm md:text-base">
                      {remaindedPrices[order.id] || "در حال بارگذاری..."}
                    </td>
                    <td className="border-gray-300 px-6 py-2 text-gray-700 text-sm md:text-base">
                      {DDate[order.id] || "در حال بارگذاری..."}
                    </td>
                    <td className="border-gray-300 px-6 py-2 text-gray-700 text-sm md:text-base">
                      <button
                        onClick={() => {
                          handleShowAttribute(order, order.status);
                          setIsModelOpen(true);
                        }}
                        className="secondry-btn"
                      >
                        نمایش
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="border p-3 text-center">
                    هیچ سفارشی وجود ندارد
                  </td>
                </tr>
              )}
            </tbody>
          </table>{" "}
          {/* Buttons for Show More / Show Less */}
          <div className="flex justify-center gap-x-4 mt-4">
            {visibleCount < orders.length && (
              <button onClick={showMore} className="secondry-btn">
                نمایش بیشتر
              </button>
            )}
            {visibleCount > 10 && (
              <button onClick={showLess} className="secondry-btn">
                نمایش کمتر
              </button>
            )}
          </div>
          {searchResults.length > 0 && (
            <div
              className={`{${
                selectedAttribute > 0
              }:hidded } items-center flex justify-center`}
            >
              <button
                onClick={() => setSearchResults("")}
                className="bg-blue-500 p-1 rounded-lg flex items-center gap-2 "
              >
                <span>
                  <FaArrowRightLong />
                </span>
                <span>بازگشت</span>
              </button>
            </div>
          )}
        </div>
      </center>

      {/* Popup */}

      {isModelOpen && (
        <>
          {/* Overlay to disable interaction with the rest of the page */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setIsModelOpen(false)} // Optional: Close modal on overlay click
          ></div>

          {/* Modal Content */}
          <div
            id="bill-content"
            className="scale-75 fixed inset-0 bg-opacity-75 flex items-center justify-center z-50"
          >
            <button
              onClick={() => setIsModelOpen(!isModelOpen)}
              className="absolute -top-16 border-gray-900 bg-gray-400 rounded-full p-1 h-10 w-10 text-red-800 text-3xl z-50"
            >
              ✕
            </button>
            <Bill order={passedOrder} />
            <button
              onClick={printBill}
              className="absolute secondry-btn -bottom-20 text-lg px-4  z-50"
            >
              چاپ بیل
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default TokenOrders;
