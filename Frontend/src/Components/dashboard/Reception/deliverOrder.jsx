// Deliver.jsx
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import CryptoJS from "crypto-js";
import jwt_decode from "jwt-decode";
import axios from "axios";
import SearchBar from "../../../Utilities/Searching"; // Correct the path

const BASE_URL = import.meta.env.VITE_BASE_URL;

const Deliver = () => {
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
  const [visibleCount, setVisibleCount] = useState(10);
  const [categories, setCategories] = useState([]);
  const [token, setToken] = useState(
    decryptData(localStorage.getItem("auth_token"))
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshingToken, setRefreshingToken] = useState(false); // Add this line
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const showMore = () => {
    setVisibleCount((prev) => prev + 10);
  };

  const showLess = () => {
    setVisibleCount(10);
  };

  const isTokenExpired = (token) => {
    const decoded = jwt_decode(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  };

  const refreshAuthToken = async () => {
    if (refreshingToken) return;

    setRefreshingToken(true);
    try {
      const refreshToken = decryptData(localStorage.getItem("refresh_token"));
      const response = await axios.post(
        `${BASE_URL}/users/user/token/refresh/`,
        { refresh: refreshToken }
      );
      const newAuthToken = response.data.access;
      decryptData(localStorage.setItem("auth_token", newAuthToken));
      setToken(newAuthToken);
      return newAuthToken;
    } catch (error) {
      console.error("Error refreshing token:", error);
      setError("Error refreshing token");
      return null;
    } finally {
      setRefreshingToken(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchCategories();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const results = orders.filter((order) => {
        const customerName = order.customer_name || "";
        const orderName = order.order_name || "";
        const categoryName =
          categories.find((category) => category.id == order.category)?.name ||
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

  const fetchCategories = async () => {
    if (!token) {
      setError("No authentication token found.");
      return;
    }

    if (isTokenExpired(token)) {
      const newToken = await refreshAuthToken();
      if (!newToken) {
        setError("Unable to refresh token");
        return;
      }
    }

    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/group/categories/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }
      const categoriesData = await response.json();
      setCategories(categoriesData);
    } catch (error) {
      setError("Error fetching categories");
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/group/order/done/`);
      setOrders(response.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const markAsDelivered = async (id) => {
    const result = await Swal.fire({
      title: "آیا مطمئن هستید؟",
      text: "این سفارش به وضعیت 'تحویل داده شد' تغییر خواهد کرد!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "بله، انجام بده",
      cancelButtonText: "لغو",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      try {
        await axios.post(`${BASE_URL}/group/update-order-status/`, {
          order_id: id,
          status: "delivered",
        });

        setOrders((prevOrders) =>
          prevOrders.filter((order) => order.id !== id)
        );

        Swal.fire({
          icon: "success",
          title: "سفارش تحویل شد",
          text: "وضعیت سفارش با موفقیت به 'تحویل داده شد' تغییر کرد.",
          confirmButtonText: "باشه",
        });
      } catch (err) {
        console.error("Error updating order status:", err);

        Swal.fire({
          icon: "error",
          title: "خطا در تغییر وضعیت",
          text: "مشکلی در تغییر وضعیت سفارش به وجود آمد. لطفاً دوباره تلاش کنید.",
          confirmButtonText: "متوجه شدم",
        });
      }
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="w-[400px] md:w-[700px]  mt-10 lg:w-[90%] mx-auto  lg:overflow-hidden">
      <h2 className="md:text-2xl text-base font-Ray_black text-center font-bold mb-4">
        لیست تحویلی سفارشات
      </h2>
      <SearchBar
        placeholder="جستجو..."
        value={searchTerm}
        onChange={handleSearchChange}
      />
      <div className=" overflow-x-scroll  bg-white w-full rounded-lg md:w-full">
        <table className="min-w-full bg-white shadow-md rounded-lg border border-gray-200">
          <thead className="">
            <tr className="bg-green text-gray-100 text-center">
              <th className="border border-gray-300 px-6 py-2.5 text-sm font-semibold">
                نام مشتری
              </th>
              <th className="border border-gray-300 px-6 py-2.5 text-sm font-semibold">
                نام سفارش
              </th>
              <th className="border border-gray-300 px-6 py-2.5 text-sm font-semibold">
                دسته‌بندی
              </th>
              <th className="border border-gray-300 px-6 py-2.5 text-sm font-semibold">
                عملیات
              </th>
            </tr>
          </thead>
          <tbody>
            {(searchResults.length > 0 ? searchResults : orders).length > 0 ? (
              (searchResults.length > 0 ? searchResults : orders)
                .slice(0, visibleCount)
                .map((order) => (
                  <tr
                    key={order.id}
                    className="text-center font-bold border-b border-gray-200 bg-white hover:bg-gray-200 transition-all"
                  >
                    <td className="border-gray-300 px-6 py-2 text-gray-700">
                      {order.customer_name}
                    </td>
                    <td className="border-gray-300 px-6 py-2 text-gray-700">
                      {order.order_name}
                    </td>
                    <td className="border-gray-300 px-6 py-2 text-gray-700">
                      {categories.find(
                        (category) => category.id == order.category
                      )?.name || "دسته‌بندی نامشخص"}
                    </td>
                    <td className="border-gray-300 px-6 py-2 text-gray-700">
                      {order.status === "done" ? (
                        <button
                          onClick={() => markAsDelivered(order.id)}
                          className="secondry-btn"
                        >
                          تحویل سفارش
                        </button>
                      ) : (
                        <span className="text-green-600 font-semibold">
                          تحویل داده شد
                        </span>
                      )}
                    </td>
                  </tr>
                ))
            ) : (
              <tr>
                <td colSpan="4" className="border p-2 text-center">
                  هیچ سفارشی برای وضعیت {searchTerm ? "جستجو" : "تکمیل شده"}{" "}
                  پیدا نشد.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {/* Buttons for Show More / Show Less */}
        <div className="flex justify-center gap-x-4 mt-4">
          {visibleCount < orders.length && searchResults.length === 0 && (
            <button onClick={showMore} className="secondry-btn">
              نمایش بیشتر
            </button>
          )}
          {visibleCount > 10 && searchResults.length === 0 && (
            <button onClick={showLess} className="secondry-btn">
              نمایش کمتر
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Deliver;
