import React, { useState, useEffect } from "react";
import axios from "axios";
import html2canvas from "html2canvas";
import ReactDOMServer from "react-dom/server";
import { startTransition } from "react"; // Import startTransition
import jwt_decode from "jwt-decode";
import CryptoJS from "crypto-js";
import Bill from "../../Bill_Page/Bill.jsx";
import Swal from "sweetalert2";
import Pagination from "../../../Utilities/Pagination.jsx";
const BASE_URL = import.meta.env.VITE_BASE_URL;


const OrderList = () => {
  const [showBill, setShowBill] = useState(false); // State to control Bill rendering
  const [orders, setOrders] = useState([]);
  const [passedOrder, setPassedOrder] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState(null); // Store the orderId of the order to be deleted
  const [isModelOpen, setIsModelOpen] = useState(false);
  const [isViewModelOpen, setIsViewModelOpen] = useState(false);
  const [selectedAttribute, setSelectedAttribute] = useState({}); // State for popup data
  const [categories, setCategories] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [users, setUsers] = useState([]);
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
  const [modalData, setModalData] = useState({
    receive_price: "",
    total_price: "",
    reminder_price: "",
    deliveryDate: "",
    order: selectedOrder,
  });
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(
    decryptData(localStorage.getItem("auth_token"))
  );
  const [refreshingToken, setRefreshingToken] = useState(false); // Prevent multiple refresh requests

  // Function to get JWT token from localStorage
  const getAuthToken = () => {
    return decryptData(localStorage.getItem("auth_token"));
  };

  // Function to check if token is expired
  const isTokenExpired = (token) => {
    const decoded = jwt_decode(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  };

  // Function to refresh token using the refresh token
  const refreshAuthToken = async () => {
    if (refreshingToken) return; // Prevent multiple refresh requests

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


  const fetchOrders = async () => {
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

    try {
      const response = await axios.get(`${BASE_URL}/group/order/pending`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.length === 0) {
        setError("No orders found.");
        return;
      }

      // Filter orders that are missing either total_price or receive_price
      const filteredOrders = response.data.filter(
        (order) => !order.total_price || !order.receive_price
      );

      setOrders(filteredOrders); // Now you're setting the filtered list of orders that are missing price
    } catch (error) {
      console.error("Error fetching orders:", error);
      setError("Error fetching orders.");
    }
  };

  // Fetch categories from API
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
  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/users/api/users`);
      setUsers(response.data);
    } catch (error) {
      setError("Error fetching categories");
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const intervalId = setInterval(() => {
      fetchOrders();
    }, 5000); // Call fetchOrder every 5 seconds

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  // Fetch orders and categories on mount
  useEffect(() => {
    fetchCategories();
    fetchUsers();
  }, [token]); // Dependency array now includes token to refetch when token changes

  // Handle "check" button click (open modal)
  const handleCheckClick = (order) => {
    setSelectedOrder(order.id);
    const category = categories.find((cat) => cat.id === order.category_id);
    const initialPrice =
      category && category.default_price !== undefined
        ? category.default_price
        : "";

    setModalData({
      receive_price: order.receive_price || "",
      total_price: order.total_price || "",
      reminder_price: order.reminder_price || "", // Show reminder_price here
      deliveryDate: order.deliveryDate || "",
      order_name: order.order_name,
      customer_name: order.customer_name,
      description: order.description || "",
      category_name: category ? category.name : "",
    });

    setShowModal(true);
  };

  // Handle delete button click
  const handleDelete = async (orderId) => {
    let token = decryptData(localStorage.getItem("auth_token"));

    if (!token) {
      setError("No authentication token found.");
      return;
    }

    if (isTokenExpired(token)) {
      token = await refreshAuthToken();
      if (!token) {
        setError("Unable to refresh token");
        return;
      }
    }

    // Show confirmation dialog
    const result = await Swal.fire({
      title: "آیا مطمئن هستید؟",
      text: "پس از حذف، این سفارش قابل بازیابی نخواهد بود!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "بله، حذف شود",
      cancelButtonText: "لغو",
    });

    if (!result.isConfirmed) return;

    try {
      const response = await axios.delete(
        `${BASE_URL}/group/orders/${orderId}/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Order deleted:", response.data);
      setOrders(orders.filter((order) => order.id !== orderId)); // Remove deleted order
      setIsModelOpen(false); // Close modal

      // Show success message
      Swal.fire({
        title: "حذف شد!",
        text: "سفارش مورد نظر با موفقیت حذف گردید.",
        icon: "success",
        confirmButtonText: "باشه",
      });
    } catch (error) {
      console.error("Error deleting order:", error);

      // Show error message
      Swal.fire({
        title: "خطا!",
        text: "حذف سفارش با مشکل مواجه شد. لطفاً دوباره امتحان کنید.",
        icon: "error",
        confirmButtonText: "متوجه شدم",
      });
    }
  };

  // Handle input change in the modal
  const handleModalChange = (e) => {
    const { name, value } = e.target;
    setModalData((prevData) => ({ ...prevData, [name]: value }));
  };

  // Handle form submission in modal (update order)

  const handleModalSubmit = async () => {
    const updatedOrder = {
      price: modalData.total_price || null,
      receive_price: modalData.receive_price || null,
      delivery_date: modalData.deliveryDate || null,
      order: selectedOrder || null,
    };

    try {
      let token = getAuthToken();
      if (!token) {
        throw new Error("توکن احراز هویت وجود ندارد.");
      }

      if (isTokenExpired(token)) {
        token = await refreshAuthToken();
        if (!token) {
          throw new Error("بروز رسانی توکن با شکست مواجه شد.");
        }
      }

      const headers = { Authorization: `Bearer ${token}` };

      // Update order status
      await axios.post(
        `${BASE_URL}/group/update-order-status/`,
        { order_id: selectedOrder, status: "taken" },
        { headers }
      );

      // Update the order details
      await axios.post(`${BASE_URL}/group/reception-orders/`, updatedOrder, {
        headers,
      });

      // Close the modal and update orders list
      setShowModal(false);
      setOrders((prevOrders) =>
        prevOrders.filter((order) => order.id !== selectedOrder)
      );

      // Success message
      Swal.fire({
        icon: "success",
        title: "قیمت با موفقیت ثبت شد",
        text: "سفارش با موفقیت بروزرسانی شد.",
        confirmButtonText: "تایید",
      });

      console.log("Order updated successfully.");
    } catch (error) {
      console.error("Error updating the order:", error);

      let errorMessage = "خطا در به‌روزرسانی سفارش. لطفاً دوباره تلاش کنید.";

      if (error.response) {
        if (error.response.status === 403) {
          errorMessage = "شما اجازه ویرایش این سفارش را ندارید.";
        } else {
          errorMessage = `به‌روزرسانی سفارش ناموفق بود. سرور پاسخ داد: ${
            error.response.data.message || error.response.status
          }`;
        }
      }

      // Error message
      Swal.fire({
        icon: "error",
        title: "خطا در ثبت قیمت",
        text: errorMessage,
        confirmButtonText: "متوجه شدم",
      });
    }
  };

  const handleShowAttribute = (order) => {
    setPassedOrder(order);
    console.log(order);
    // Convert JSON object to an array
    const attributeArray = Object.entries(order.attributes); // Converts to array of [key, value] pairs
    setIsViewModelOpen(!isViewModelOpen);
    // Update state
    setSelectedAttribute(order);
  };

  const handleClosePopup = () => {
    setIsViewModelOpen(false);
  };
  //  pagination section
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 15;

  // Calculate pagination
  const totalPages = Math.ceil(orders.length / postsPerPage);
  const paginatedOrders = [...orders] // Create a copy to avoid mutation
    .slice((currentPage - 1) * postsPerPage, currentPage * postsPerPage);

  return (
    <div className="w-[400px] md:w-[700px]  mt-10 lg:w-[90%] mx-auto  lg:overflow-hidden">
      <h2 className="md:text-2xl text-base font-Ray_black text-center font-bold mb-4">
        لیست سفارشات
      </h2>

      {loading && <p>در حال بارگذاری...</p>}

      <center>
        <div className=" overflow-x-scroll lg:overflow-hidden bg-white w-full rounded-lg md:w-full">
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
                  طراح
                </th>
                <th className="border border-gray-300 px-6 py-2.5 text-sm font-semibold">
                  اقدامات
                </th>
                <th className="border border-gray-300 px-6 py-2.5 text-sm font-semibold">
                  جزئیات
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.length > 0 ? (
                paginatedOrders.map((order) => (
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
                        (category) => category.id === order.category
                      )?.name || "دسته‌بندی نامشخص"}
                    </td>
                    <td className="border-gray-300 px-6 py-2 text-gray-700">
                      {
                        users.find((user) => user.id === order.designer)
                          ?.first_name
                      }
                    </td>
                    <td className="border-gray-300 px-6 py-2 text-gray-700 gap-x-5 flex justify-center ">
                      <button
                        onClick={() => handleCheckClick(order)}
                        className="bg-green h-8 w-8 text-white p-1 rounded"
                      >
                        ✔
                      </button>
                      <button
                        onClick={() => handleDelete(order.id)}
                        className="bg-red-500 text-white p-1 h-8 w-8 rounded hover:bg-red-600"
                      >
                        ✖
                      </button>
                    </td>
                    <td className="border-gray-300 px-6 py-2 text-gray-700">
                      <button
                        onClick={() => {
                          handleShowAttribute(order);
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
                  <td colSpan="5" className="border p-2 text-center">
                    هیچ سفارشی بدون قیمت پیدا نشد
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {/* Pagination Component */}
        </div>
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </center>

      {/* Modal for Price and Delivery Date */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex flex-col gap-5 items-center justify-center">
          <div className="bg-white">
            <div className="bg-white p-6 rounded  w-[350px]  md:w-[600px]">
              <h3 className="text-lg text-center font-bold mb-4">
                اضافه کردن قیمت و تاریخ تحویل
              </h3>
              <div className="mb-4">
                <label className="block mb-1 font-medium">قیمت:</label>
                <input
                  type="number"
                  name="total_price"
                  value={modalData.total_price || ""}
                  onChange={handleModalChange}
                  className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-green"
                  placeholder="قیمت را وارد کنید"
                />
              </div>

              <div className="mb-4">
                <label className="block mb-1 font-medium">قیمت دریافتی:</label>
                <input
                  type="number"
                  name="receive_price"
                  value={modalData.receive_price}
                  onChange={handleModalChange}
                  className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-green"
                  placeholder="قیمت دریافتی را وارد کنید"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block mb-1 font-medium">تاریخ تحویل:</label>
                <input
                  type="date"
                  name="deliveryDate"
                  value={modalData.deliveryDate}
                  onChange={handleModalChange}
                  className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-green"
                  required
                />
              </div>
            </div>
            <div className="flex justify-center pb-6 items-center gap-2">
              <button
                onClick={handleModalSubmit}
                className="bg-green text-white px-7 font-bold py-2 rounded hover:bg-green/90"
              >
                تایید
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                انصراف
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Conditionally render the Bill component */}
      {isViewModelOpen && passedOrder && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
            <h3 className="text-xl font-bold mb-4 text-gray-800">
              اطلاعات سفارش
            </h3>
            <div className="bg-gray-100 p-4 rounded overflow-auto text-sm space-y-2">
              {passedOrder &&
                Object.entries(passedOrder.attributes).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex justify-between items-center border-b border-gray-300 pb-2"
                  >
                    <span className="font-medium text-gray-700">{key}</span>
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

export default OrderList;
