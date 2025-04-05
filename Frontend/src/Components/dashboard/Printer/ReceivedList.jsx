import axios from "axios";
import React, { useEffect, useState, useCallback } from "react";
import CryptoJS from "crypto-js";
import Swal from "sweetalert2";
import SearchBar from "../../../Utilities/Searching";
import Pagination from "../../../Utilities/Pagination";
import jalaali from "jalaali-js";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const ReceivedListVisitCard = () => {
  const secretKey = "TET4-1";
  const decryptData = useCallback((hashedData) => {
    if (!hashedData) return null;
    try {
      const bytes = CryptoJS.AES.decrypt(hashedData, secretKey);
      return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    } catch (error) {
      console.error("Decryption failed:", error);
      return null;
    }
  }, []);

  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [visitCard, setVisitCard] = useState();
  const [categories, setCategories] = useState([]);
  const [isModelOpen, setIsModelOpen] = useState(false);
  const [orderDetails, setOrderDetails] = useState({});
  const [orderPrice, setOrderprice] = useState({});
  const [selectedOrderId, setSelectedOrderId] = useState();
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;
  const [totalOrders, setTotalOrders] = useState(0);
  const roles = [
    { id: 1, name: "Designer" },
    { id: 2, name: "Reception" },
    // { id: 0, name: "Admin" },
    { id: 3, name: "Head_of_designers" },
    { id: 4, name: "Printer" },
    { id: 5, name: "Delivery" },
    { id: 6, name: "Digital" },
    { id: 7, name: "Bill" },
    { id: 8, name: "Chaspak" },
    { id: 9, name: "Shop_role" },
    { id: 10, name: "Laser" },
  ];
  useEffect(() => {
    fetchUsers();
  }, []);
  const newRole = roles.find(
    (role) => role.id == decryptData(localStorage.getItem("role"))?.name
  );
  const handleAdd = useCallback(
    async (order) => {
      const result = await Swal.fire({
        title: "آیا مطمئن هستید؟",
        text: "این سفارش به وضعیت 'کامل' تغییر خواهد کرد!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "بله، تغییر بده",
        cancelButtonText: "لغو",
        reverseButtons: true,
      });

      if (!result.isConfirmed) return;

      console.log(order);

      let nextStatus;
      const category = categories.find((cat) => cat.id === order.category);

      if (category && Array.isArray(category.stages)) {
        const currentIndex = category.stages.indexOf(order.status);

        if (currentIndex !== -1 && currentIndex < category.stages.length - 1) {
          nextStatus = category.stages[currentIndex + 1];
        } else {
          console.log("No next status available.");
          return;
        }
      } else {
        console.log("Stages not found or not an array.");
        return;
      }

      try {
        await axios.post(`${BASE_URL}/group/update-order-status/`, {
          order_id: order.id,
          status: nextStatus,
        });

        // ✅ Correctly update the order status without removing the order
        setOrders((prevOrders) =>
          prevOrders.map((o) =>
            o.id === order.id ? { ...o, status: nextStatus } : o
          )
        );

        Swal.fire({
          icon: "success",
          title: "سفارش بروزرسانی شد",
          text: `وضعیت سفارش به 'کامل' تغییر کرد.`,
          confirmButtonText: "باشه",
        });
        getTakenList();
      } catch (err) {
        console.error("Error changing status", err);

        Swal.fire({
          icon: "error",
          title: "خطا در تغییر وضعیت",
          text: "مشکلی در تغییر وضعیت سفارش به وجود آمد. لطفاً دوباره تلاش کنید.",
          confirmButtonText: "متوجه شدم",
        });
      }
    },
    [BASE_URL, categories]
  );
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
  const getDetails = useCallback(
    async (id) => {
      try {
        const token = decryptData(localStorage.getItem("auth_token"));
        const response = await axios.get(
          `${BASE_URL}/group/order-by-price/?order=${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        setOrderprice(response.data[0]);
        setIsModelOpen(!isModelOpen);
      } catch (err) {
        console.error("Error fetching order details:", err);
      }
    },
    [BASE_URL, decryptData]
  );

  const convertToHijriShamsi = (dateString) => {
    if (!dateString) return 0;
    const date = new Date(dateString);
    const { jy, jm, jd } = jalaali.toJalaali(
      date.getFullYear(),
      date.getMonth() + 1,
      date.getDate()
    );
    return `${jy}/${jm.toString().padStart(2, "0")}/${jd
      .toString()
      .padStart(2, "0")}`;
  };

  const handleClosePopup = useCallback(() => {
    setIsModelOpen(false);
  }, []);

  // Fetch orders from the backend with pagination

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      const response = await axios.get(`${BASE_URL}/group/categories/`);
      setCategories(response.data);
      setVisitCard(response.data.find((c) => c.name == "کارت ویزیت")?.id);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  }, []);

  // Pagination handler
  const onPageChange = useCallback((page) => {
    setCurrentPage(page);
    console.log(page);
  }, []);
  const getTakenList = useCallback(async () => {
    try {
      // Ensure categories are fetched first
      await fetchCategories();

      const newrole = roles.find(
        (r) => r.id == decryptData(localStorage.getItem("role"))
      )?.name;

      const response = await axios.get(
        `${BASE_URL}/group/order/${newrole}/?pagenum=${currentPage}`
      );
      console.log(response.data);

      if (Array.isArray(response.data.results)) {
        setOrders(
          response.data.results.filter((order) => order.category !== visitCard)
        );
      } else {
        setOrders([]);
        console.warn("Unexpected response format:", response.data);
      }
      setTotalOrders(response.data.count);
    } catch (err) {
      console.error("Error fetching List", err);
      setOrders([]); // Ensure orders is always an array
    }
  }, [visitCard, BASE_URL]);

  useEffect(() => {
    if (!visitCard) {
      const found = categories.find((c) => c.name === "ویزیت کارت");
      if (found) setVisitCard(found.id);
    }
  }, [categories, visitCard]);

  useEffect(() => {
    if (visitCard) {
      getTakenList(currentPage);
    }
  }, [currentPage, visitCard]);

  // Calculate total pages based on the backend count
  const totalPages = Math.ceil(totalOrders / pageSize);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-[400px] md:w-[700px] mt-10 lg:w-[70%] mx-auto">
      <h2 className="md:text-2xl text-base font-Ray_black text-center font-bold mb-4">
        لیست سفارشات دریافتی
      </h2>

      <SearchBar
        placeholder="جستجو..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <div className="overflow-x-scroll lg:overflow-hidden bg-white w-full rounded-lg">
        <table className="min-w-full bg-white rounded-lg border border-gray-200">
          <thead className="bg-gray-100">
            <tr className="bg-green text-gray-100 text-center">
              <th className="border px-6 py-2.5 text-sm font-semibold">
                کدسفارش
              </th>
              <th className="border px-6 py-2.5 text-sm font-semibold">
                مشتری
              </th>
              <th className="border px-6 py-2.5 text-sm font-semibold">
                نام سفارش
              </th>
              <th className="border px-6 py-2.5 text-sm font-semibold">طراح</th>
              <th className="border px-6 py-2.5 text-sm font-semibold">
                دسته بندی
              </th>
              <th className="border px-6 py-2.5 text-sm font-semibold">
                اقدامات
              </th>
            </tr>
          </thead>
          <tbody>
            {orders.length > 0 ? (
              orders.map((order, index) => {
                const designer = users.find((user) => user.id == order.designer)
                  ? `${
                      users.find((user) => user.id == order.designer).first_name
                    } ${
                      users.find((user) => user.id == order.designer).last_name
                    }`
                  : "نامشخص";

                const category = categories.find(
                  (cat) => cat.id === order.category
                );
                const categoryName = category
                  ? category.name
                  : "دسته‌بندی نامشخص";

                return (
                  <tr
                    key={order.id}
                    className={`text-center font-bold border-b border-gray-200 ${
                      index % 2 === 0 ? "bg-gray-50" : "bg-white"
                    }`}
                  >
                    <td className="border px-6 py-2">{order.secret_key}</td>
                    <td className="border px-6 py-2">{order.customer_name}</td>
                    <td className="border px-6 py-2">{order.order_name}</td>
                    <td className="border px-6 py-2">{designer}</td>
                    <td className="border px-6 py-2">{categoryName}</td>
                    <td className="border px-6 py-2 flex gap-x-5 justify-center">
                      <button
                        onClick={() => handleAdd(order)}
                        className="secondry-btn"
                      >
                        تایید تکمیلی
                      </button>
                      <button
                        onClick={() => {
                          setOrderDetails(order);
                          getDetails(order.id);
                          setSelectedOrderId(order.id);
                        }}
                        className="secondry-btn"
                      >
                        جزئیات
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan="6"
                  className="border p-2 text-center text-gray-600"
                >
                  {loading ? "در حال بارگذاری..." : "هیچ سفارشی یافت نشد."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalOrders={totalOrders}
        pageSize={pageSize}
        onPageChange={onPageChange}
      />

      {isModelOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg  w-full">
            <h3 className="text-xl font-bold mb-4 text-gray-800">
              اطلاعات سفارش
            </h3>
            {console.log(orderDetails)}
            <div className="bg-gray-100 p-4 rounded overflow-auto text-sm space-y-2">
              {orderDetails.attributes &&
                Object.entries(orderDetails.attributes).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex justify-between items-center border-b border-gray-300 pb-2"
                  >
                    <span className="font-medium text-gray-700">{key}:</span>
                    <span className="text-gray-900">{String(value)}</span>
                  </div>
                ))}
              <div className="flex justify-between items-center border-b border-gray-300 pb-2">
                <span className="font-medium text-gray-700"> تاریخ اخذ</span>
                <span className="text-gray-900">
                  {convertToHijriShamsi(orderDetails.created_at)}
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-300 pb-2">
                <span className="font-medium text-gray-700">تاریخ تحویل</span>
                <span className="text-gray-900">
                  {orderPrice.delivery_date}
                </span>
              </div>
            </div>
            <div className="flex justify-center mt-5 items-center w-full">
              <button onClick={handleClosePopup} className="tertiary-btn">
                بستن
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceivedListVisitCard;
