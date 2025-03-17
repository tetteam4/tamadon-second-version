// DoneList.jsx
import axios from "axios";
import React, { useEffect, useState } from "react";
import CryptoJS from "crypto-js";
import SearchBar from "../../../Utilities/Searching";
import Pagination from "../../../Utilities/Pagination";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const DoneList = () => {
  const secretKey = "TET4-1";
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
  const [visibleCount, setVisibleCount] = useState(20);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const showMore = () => {
    setVisibleCount((prev) => prev + 20);
  };

  const showLess = () => {
    setVisibleCount(10);
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/group/categories/`);
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const getDoneList = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/group/order/done/`);
      setOrders(response.data);
    } catch (err) {
      console.log("Error fetching done orders:", err);
    }
  };

  const handleShowDetails = async (id) => {
    try {
      const token = decryptData(localStorage.getItem("auth_token"));
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
    getDoneList();
    fetchCategories();
      getDoneList();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const results = orders.filter((order) => {
        const customerName = order.customer_name || "";
        const orderName = order.order_name || "";
        const categoryName =
          categories.find((category) => category.id === order.category)?.name ||
          "";

        return (
          customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          orderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          categoryName.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchTerm, orders, categories]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 15;

  const dataToPaginate = searchResults.length > 0 ? searchResults : orders;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const totalPages = Math.ceil(dataToPaginate.length / postsPerPage);
  const paginatedOrders = [...dataToPaginate]
    .reverse()
    .slice((currentPage - 1) * postsPerPage, currentPage * postsPerPage);

  return (
    <div
      dir="rtl"
      className="w-[400px] md:w-[700px] mt-10 lg:w-[70%] mx-auto lg:overflow-hidden"
    >
      <h2 className="md:text-2xl text-base font-Ray_black text-center font-bold mb-4">
        لیست سفارشات تکمیلی
      </h2>
      <SearchBar
        placeholder="جستجو..."
        value={searchTerm}
        onChange={handleSearchChange}
      />

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
                جزئیات
              </th>
            </tr>
          </thead>
          <tbody>
            {dataToPaginate.length > 0 ? (
              paginatedOrders.map((order, index) => (
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
                  <td className="border-gray-300 px-6 py-2 text-gray-700">
                    <button
                      onClick={() => handleShowDetails(order.id)}
                      className="secondry-btn"
                    >
                      جزئیات
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="border p-2 text-center">
                  هیچ سفارشی برای وضعیت "{searchTerm ? "جستجو" : "تکمیل شده"}"
                  پیدا نشد.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* Pagination Component */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

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
                    <span className="font-medium text-gray-700">{key}</span>
                    <span className="text-gray-900">{String(value)}</span>
                  </div>
                ))}
            </div>
            <div className="flex justify-center mt-5 items-center w-full">
              <button
                onClick={handleClosePopup}
                className="tertiary-btn"
              >
                بستن
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoneList;
