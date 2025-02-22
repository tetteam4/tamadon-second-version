import axios from "axios";
import React, { useEffect, useState } from "react";
import CryptoJS from "crypto-js";
import Swal from "sweetalert2";
const BASE_URL = import.meta.env.VITE_BASE_URL;

const ProcessingList = () => {
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
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isModelOpen, setIsModelOpen] = useState(false);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [visibleCount, setVisibleCount] = useState(20); // Initial visible items

  const showMore = () => {
    setVisibleCount((prev) => prev + 20); // Show 10 more items
  };

  const showLess = () => {
    setVisibleCount(10); // Reset to 10 items
  };
  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/group/categories/`);
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const getProcessingList = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/group/order/processing/`);
      setOrders(response.data);
    } catch (err) {
      console.error("Error fetching processing list:", err);
    }
  };

  const handleAdd = async (id) => {
    // Show confirmation alert before proceeding
    const result = await Swal.fire({
      title: "آیا مطمئن هستید؟",
      text: "این سفارش به وضعیت 'تکمیل شده' تغییر خواهد کرد!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "بله، انجام بده",
      cancelButtonText: "لغو",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      try {
        // Update the order status
        await axios.post(`${BASE_URL}/group/update-order-status/`, {
          order_id: id,
          status: "done",
        });

        // Remove the order from the orders state
        setOrders((prevOrders) =>
          prevOrders.filter((order) => order.id !== id)
        );

        // Show success message
        Swal.fire({
          icon: "success",
          title: "سفارش تکمیل شد",
          text: "وضعیت سفارش با موفقیت به 'تکمیل شده' تغییر کرد.",
          confirmButtonText: "باشه",
        });
      } catch (err) {
        console.error("Error changing status:", err);

        // Show error message
        Swal.fire({
          icon: "error",
          title: "خطا در تغییر وضعیت",
          text: "مشکلی در تغییر وضعیت سفارش به وجود آمد. لطفاً دوباره تلاش کنید.",
          confirmButtonText: "متوجه شدم",
        });
      }
    }
  };

  const handleShowDetails = async (id) => {
    try {
      const token = decryptData(localStorage.getItem("auth_token")); // Retrieve token from localStorage
      const response = await axios.get(`${BASE_URL}/group/orders/${id}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      setSelectedOrderDetails(response.data.attributes);
      setIsModelOpen(true);
    } catch (err) {
      console.error("Error fetching order details:", err);
    }
  };

  const handleClosePopup = () => {
    setIsModelOpen(false);
    setSelectedOrderDetails(null);
  };

  useEffect(() => {
    getProcessingList();
    fetchCategories();
    const intervalId = setInterval(() => {
      getProcessingList();
    }, 2000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div
      dir="rtl"
      className="w-[400px] md:w-[700px] mt-10 lg:w-[70%] mx-auto lg:overflow-hidden"
    >
      <h2 className="md:text-2xl text-base font-Ray_black text-center font-bold mb-4">
        لیست سفارشات دریافتی
      </h2>
      <div className="overflow-x-scroll lg:overflow-hidden bg-white w-full rounded-lg md:w-full">
        <table className="min-w-full bg-white shadow-md rounded-lg border border-gray-200">
          <thead className="bg-gray-100">
            <tr className="bg-green text-gray-100 text-center">
              <th className="border border-gray-300 px-6 py-2.5 text-sm font-semibold">
                مشتری
              </th>
              <th className="border border-gray-300 px-6 py-2.5 text-sm font-semibold">
                نام سفارش
              </th>
              <th className="border border-gray-300 px-6 py-2.5 text-sm font-semibold">
                دسته بندی
              </th>
              <th className="border border-gray-300 px-6 py-2.5 text-sm font-semibold">
                اقدامات
              </th>
            </tr>
          </thead>
          <tbody>
            {orders.length ? (
              orders.slice(0, visibleCount).reverse().map((order, index) => (
                <tr
                  key={order.id}
                  className={`text-center font-bold border-b border-gray-200 bg-white hover:bg-gray-200 transition-all ${
                    index % 2 === 0 ? "bg-gray-50" : "bg-white"
                  } hover:bg-gray-100`}
                >
                  <td className="border-gray-300 px-6 py-2 text-gray-700">
                    {order.customer_name}
                  </td>
                  <td className="border-gray-300 px-6 py-2 text-gray-700">
                    {order.order_name}
                  </td>
                  <td className="border-gray-300 px-6 py-2 text-gray-700">
                    {categories.find(
                      (category) => category.id === order.category
                    )?.name || "دسته‌بندی نامشخص"}
                  </td>
                  <td className="border-gray-300 px-6 flex items-center gap-x-5 justify-center text-gray-700">
                    <button
                      onClick={() => handleAdd(order.id)}
                      className="secondry-btn"
                    >
                      تایید تکمیلی
                    </button>
                    <button
                      onClick={() => handleShowDetails(order.id)}
                      className="m-2 bg-blue-500 rounded p-2 hover:bg-blue-700 text-white"
                    >
                      جزئیات
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="border p-2 text-center">
                  هیچ سفارشی برای وضعیت "در انتظار" پیدا نشد.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="flex justify-center gap-x-4 mt-4">
          {visibleCount < orders.length && (
            <button onClick={showMore} className="secondry-btn">
              نمایش بیشتر
            </button>
          )}
          {visibleCount > 20 && (
            <button onClick={showLess} className="secondry-btn">
              نمایش کمتر
            </button>
          )}
        </div>
      </div>

      {isModelOpen && selectedOrderDetails && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
            <h3 className="text-xl font-bold mb-4 text-gray-800">
              اطلاعات سفارش
            </h3>
            <div className="bg-gray-100 p-4 rounded overflow-auto text-sm space-y-2">
              {selectedOrderDetails &&
                Object.entries(selectedOrderDetails).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex justify-between items-center border-b border-gray-300 pb-2"
                  >
                    <span className="font-medium text-gray-700">{key}:</span>
                    <span className="text-gray-900">{String(value)}</span>
                  </div>
                ))}
            </div>
            <button
              onClick={handleClosePopup}
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              بستن
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProcessingList;
