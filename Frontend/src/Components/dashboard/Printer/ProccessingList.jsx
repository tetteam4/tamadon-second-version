import axios from "axios";
import React, { useEffect, useState, useMemo, useCallback } from "react";
import CryptoJS from "crypto-js";
import Swal from "sweetalert2";
import SearchBar from "../../../Utilities/Searching";
import Pagination from "../../../Utilities/Pagination";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const ProcessingList = () => {
  const secretKey = "TET4-1";
  const decryptData = useCallback(
    (hashedData) => {
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
    },
    [secretKey]
  );

  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isModelOpen, setIsModelOpen] = useState(false);
  const [orderDetails, setOrderDetails] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await axios.get(`${BASE_URL}/group/categories/`);
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  }, [BASE_URL]);

  const getProcessingList = useCallback(async () => {
    try {
      const response = await axios.get(`${BASE_URL}/group/order/processing/`);
      setOrders(response.data);
    } catch (err) {
      console.error("Error fetching processing list:", err);
    }
  }, [BASE_URL]);

  const getDetails = useCallback(
    async (id) => {
      try {
        const token = decryptData(localStorage.getItem("auth_token"));
        const response = await axios.get(`${BASE_URL}/group/orders/${id}/`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        setOrderDetails(response.data.attributes);
        setIsModelOpen(true);
      } catch (err) {
        console.error("Error fetching order details:", err);
      }
    },
    [BASE_URL, decryptData]
  );

  const handleAdd = useCallback(
    async (id) => {
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
          await axios.post(`${BASE_URL}/group/update-order-status/`, {
            order_id: id,
            status: "done",
          });

          setOrders((prevOrders) =>
            prevOrders.filter((order) => order.id !== id)
          );

          Swal.fire({
            icon: "success",
            title: "سفارش تکمیل شد",
            text: "وضعیت سفارش با موفقیت به 'تکمیل شده' تغییر کرد.",
            confirmButtonText: "باشه",
          });
        } catch (err) {
          console.error("Error changing status:", err);

          Swal.fire({
            icon: "error",
            title: "خطا در تغییر وضعیت",
            text: "مشکلی در تغییر وضعیت سفارش به وجود آمد. لطفاً دوباره تلاش کنید.",
            confirmButtonText: "متوجه شدم",
          });
        }
      }
    },
    [BASE_URL]
  );

  const handleClosePopup = useCallback(() => {
    setIsModelOpen(false);
    setOrderDetails(null);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await getProcessingList();
        await fetchCategories();
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [fetchCategories, getProcessingList]);
 /// work by aukto dgdd
  useEffect(() => {
    const roleData = localStorage.getItem("role");
    if (roleData) {
      try {
        const decryptedRole = decryptData(roleData);
        if (
          typeof decryptedRole === "object" &&
          Array.isArray(decryptedRole) &&
          decryptedRole.length > 0
        ) {
          const roleValue = decryptedRole[0];
          if (typeof roleValue === "number") {
            setUserRole(roleValue);
          } else {
            console.warn("Role must be number, but is not.");
          }
        }
      } catch (error) {
        console.error("Error decrypting role:", error);
      }
    } else {
      console.warn("No 'role' found in localStorage.");
    }
  }, [decryptData]);

  const filteredOrders = useMemo(() => {
    if (!userRole || categories.length === 0) {
      return orders;
    }

    return orders.filter((order) => {
      const category = categories.find((cat) => cat.id === order.category);
      return category && category.role === userRole;
    });
  }, [orders, categories, userRole]);

  useEffect(() => {
    if (searchTerm) {
      const results = filteredOrders.filter((order) => {
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
  }, [searchTerm, filteredOrders, categories]);

  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 15;

  const dataToPaginate =
    searchResults.length > 0 ? searchResults : filteredOrders;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filteredOrders]);

  const totalPages = Math.ceil(dataToPaginate.length / postsPerPage);
  const paginatedOrders = useMemo(
    () =>
      [...dataToPaginate]
        .reverse()
        .slice((currentPage - 1) * postsPerPage, currentPage * postsPerPage),
    [currentPage, dataToPaginate]
  );

  const onPageChange = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div
      dir="rtl"
      className="w-[400px] md:w-[700px] mt-10 lg:w-[70%] mx-auto lg:overflow-hidden"
    >
      <h2 className="md:text-2xl text-base font-Ray_black text-center font-bold mb-4">
        لیست سفارشات در حال کار
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
                اقدامات
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
                  <td className="border-gray-300 px-6 flex items-center gap-x-5 justify-center text-gray-700">
                    <button
                      onClick={() => handleAdd(order.id)}
                      className="secondry-btn"
                    >
                      تایید تکمیلی
                    </button>
                    <button
                      onClick={() => getDetails(order.id)}
                      className="m-2 bg-blue-500 rounded-lg hover:!scale-105 duration-300 py-2 px-5 text-sm hover:bg-blue-700 text-white"
                    >
                      جزئیات
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="border p-2 text-center">
                  هیچ سفارشی برای وضعیت "در حال پردازش" پیدا نشد.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      )}

      {isModelOpen && orderDetails && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
            <h3 className="text-xl font-bold mb-4 text-gray-800">
              اطلاعات سفارش
            </h3>
            <div className="bg-gray-100 p-4 rounded overflow-auto text-sm space-y-2">
              {orderDetails &&
                Object.entries(orderDetails).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex justify-between items-center border-b border-gray-300 pb-2"
                  >
                    <span className="font-medium text-gray-700">{key}:</span>
                    <span className="text-gray-900">{String(value)}</span>
                  </div>
                ))}
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

export default ProcessingList;
