import React, { useState, useEffect } from "react";
import axios from "axios";
import CryptoJS from "crypto-js";
const BASE_URL = import.meta.env.VITE_BASE_URL;
import { FaChevronDown } from "react-icons/fa";
import { IoTrashSharp } from "react-icons/io5";
import { FaRegEdit } from "react-icons/fa";
import Swal from "sweetalert2";
import { FaPlus } from "react-icons/fa";

const AddOrder = () => {
  const [categories, setCategories] = useState([]);
  const [dropdownState, setDropdownState] = useState({});

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [orders, setOrders] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [formFields, setFormFields] = useState([]);
  const [attributeChoices, setAttributeChoices] = useState([]);
  const [formData, setFormData] = useState({});
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
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
  const [form1, setForm1] = useState({
    customer_name: "",
    order_name: "",
    designer: decryptData(localStorage.getItem("email")),
    category: "",
    status: "pending",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingOrderId, setEditingOrderId] = useState(null);

  const handleForm1InputChange = (e) => {
    const { name, value } = e.target;
    setForm1((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleCategorySelect = (categoryId) => {
    setSelectedCategoryId(categoryId);
    setIsCategoryDropdownOpen(false);
    setFormData([]); // Reset form data when category changes
  };

  const fetchOrders = async () => {
    try {
      const token = decryptData(localStorage.getItem("auth_token"));
      if (!token) {
        console.error("No authentication token found in localStorage.");
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`, // Add the Authorization header
        "Content-Type": "application/json", // Optional but recommended
      };

      const response = await axios.get(`${BASE_URL}/group/orders/`, {
        headers, // Pass headers here
      });
      setOrders(response.data);
    } catch (error) {
      console.error("Error fetching orders:", error.response || error);
    }
  };
  // Fetch categories from the endpoint
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
    fetchOrders();
  }, []);
  // Fetch form fields for the selected category
  useEffect(() => {
    if (selectedCategoryId) {
      const fetchAttributes = async () => {
        try {
          const response = await axios.get(
            `${BASE_URL}/group/category/attribute/${selectedCategoryId}`
          );
          const { attribute_types, attribute_values } = response.data;

          const fields = attribute_types.map((type) => ({
            ...type,
            options: attribute_values.filter(
              (value) => value.attribute === type.id
            ),
          }));

          setFormFields(fields);
        } catch (error) {
          console.error("Error fetching attributes:", error);
        }
      };

      fetchAttributes();
    } else {
      setFormFields([]);
    }
  }, [selectedCategoryId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEdit = (order) => {
    setIsEditing(true);
    setEditingOrderId(order.id);

    // Set the main form fields (customer name, order name, category)
    setForm1({
      customer_name: order.customer_name,
      order_name: order.order_name,
      category: order.category,
      status: order.status,
    });

    // Set the selected category to load its dynamic form fields
    setSelectedCategoryId(order.category);

    // Populate the dynamic form fields (attributes)
    setFormData(order.attributes || {});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const token = decryptData(localStorage.getItem("auth_token"));
    if (!token) {
      console.error("No authentication token found in localStorage.");
      Swal.fire({
        title: "خطا!",
        text: "توکن احراز هویت یافت نشد.",
        icon: "error",
      });
      setSubmitting(false);
      return;
    }

    const payload = {
      order_name: form1.order_name || "",
      customer_name: form1.customer_name || "",
      designer: decryptData(localStorage.getItem("id")),
      category: selectedCategoryId,
      attributes: formData || {},
      status: form1.status,
    };

    try {
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      let response;
      if (isEditing) {
        // Update existing order
        response = await axios.put(
          `${BASE_URL}/group/orders/${editingOrderId}/`,
          payload,
          { headers }
        );
      } else {
        // Create new order
        console.log(payload);

        response = await axios.post(`${BASE_URL}/group/orders/`, payload, {
          headers,
        });
      }

      // Show success alert
      Swal.fire({
        title: "موفق!",
        text: isEditing
          ? "سفارش با موفقیت ویرایش شد."
          : "سفارش با موفقیت ثبت شد.",
        icon: "success",
      });

      fetchOrders(); // Refresh orders
      setSelectedCategoryId("");
      setIsEditing(false);
      setEditingOrderId(null);
      setForm1({
        customer_name: "",
        order_name: "",
        designer: decryptData(localStorage.getItem("email")),
        category: "",
        status: "pending",
      });
      setFormData({});
    } catch (error) {
      console.error("Error submitting form:", error.response || error);

      // Show error alert
      Swal.fire({
        title: "خطا!",
        text: "مشکلی در ثبت سفارش پیش آمد.",
        icon: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    const token = decryptData(localStorage.getItem("auth_token"));
    if (!token) {
      console.error("No authentication token found in localStorage.");
      return;
    }

    // Show confirmation alert
    const result = await Swal.fire({
      title: "آیا مطمئن هستید؟",
      text: "این سفارش پس از حذف قابل بازیابی نیست!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "بله، حذف شود!",
      cancelButtonText: "لغو",
    });

    if (result.isConfirmed) {
      try {
        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };
        await axios.delete(`${BASE_URL}/group/orders/${id}/`, { headers });

        Swal.fire({
          title: "حذف شد!",
          text: "سفارش با موفقیت حذف گردید.",
          icon: "success",
        });

        fetchOrders(); // Refresh orders
      } catch (error) {
        console.error("Error deleting order:", error);
        Swal.fire({
          title: "خطا!",
          text: "مشکلی در حذف سفارش پیش آمد.",
          icon: "error",
        });
      }
    }
  };

  return (
    <div className="py-10 bg-gray-200 w-full min-h-[91vh] px-5">
      <div className="flex items-center justify-center py-3">
        <button
          className="secondry-btn flex items-center justify-between gap-x-3"
          onClick={() => setIsFormOpen((prev) => !prev)}
        >
          افزون سفارش
          <FaPlus />
        </button>
      </div>
      <div className="max-w-3xl mx-auto py-4 px-5 shadow-lg bg-white rounded-md">
        {(isFormOpen || isEditing) && (
          <div>
            <h2 className="text-xl text-center font-Ray_black  font-bold mb-4">
              {isEditing ? "Edit Order" : "فورم سفارش"}
            </h2>
            <form onSubmit={handleSubmit}>
              {/* Input Fields in a Row on Larger Screens */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Customer Name */}
                <div>
                  <label htmlFor="customer_name" className="block mb-2">
                    نام مشتری
                  </label>
                  <input
                    id="customer_name"
                    name="customer_name"
                    type="text"
                    value={form1.customer_name}
                    onChange={handleForm1InputChange}
                    className="w-full px-3 py-2 border rounded focus:outline-none bg-gray-200 text-black"
                    placeholder="نام مشتری را وارد کنید"
                  />
                </div>

                {/* Order Name */}
                <div>
                  <label htmlFor="order_name" className="block mb-2">
                    نام سفارش
                  </label>
                  <input
                    id="order_name"
                    name="order_name"
                    type="text"
                    value={form1.order_name}
                    onChange={handleForm1InputChange}
                    className="w-full px-3 py-2 border focus:outline-none rounded bg-gray-200 text-black"
                    placeholder="نام سفارش را وارد کنید"
                  />
                </div>
              </div>

              {/* Category Selection */}
              <div className="mb-4 mt-3">
                <label
                  htmlFor="category"
                  className="block text-lg font-medium mb-2 text-gray-700"
                >
                  کتگوری سفارش
                </label>
                <select
                  id="category"
                  className="w-full px-3 py-2 border bg-gray-200 rounded text-black cursor-pointer"
                  value={selectedCategoryId || ""}
                  onChange={(e) => setSelectedCategoryId(e.target.value)}
                >
                  <option value="" disabled>
                    کتگوری را انتخاب کنید
                  </option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dynamic Fields */}
              <ul className="relative grid grid-cols-1 md:grid-cols-2 gap-4 list-none">
                {formFields.map((field, index) => (
                  <li key={index} className="mb-4">
                    <label htmlFor={field.name} className="block mb-1">
                      {field.name}
                    </label>
                    {field.attribute_type === "input" ? (
                      <input
                        type="text"
                        id={field.name}
                        name={field.name}
                        value={formData[field.name] || ""}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded text-black"
                      />
                    ) : field.attribute_type === "dropdown" ? (
                      <div className="relative">
                        {/* Dropdown Button */}
                        <div
                          className="w-full px-3 flex justify-between items-center py-2 border rounded text-black bg-white cursor-pointer"
                          onClick={() =>
                            setDropdownState((prev) => ({
                              ...prev,
                              [field.name]: !prev[field.name], // Toggle dropdown for this field
                            }))
                          }
                        >
                          {formData[field.name] || `انتخاب ${field.name}`}
                          <FaChevronDown
                            className={`transition-all duration-300 ${
                              dropdownState[field.name] ? "rotate-180" : ""
                            }`}
                          />
                        </div>

                        {/* Dropdown Options */}
                        {dropdownState[field.name] && (
                          <ul className="absolute w-full bg-white text-black border border-gray-300 rounded-md shadow-lg mt-1 z-10 overflow-hidden">
                            <li
                              className="p-3 hover:bg-gray-200 cursor-pointer"
                              onClick={() => {
                                handleInputChange({
                                  target: { name: field.name, value: "" },
                                });
                                setDropdownState((prev) => ({
                                  ...prev,
                                  [field.name]: false, // Close dropdown
                                }));
                              }}
                            >
                              انتخاب {field.name}
                            </li>
                            {field.options.map((option) => (
                              <li
                                key={option.id}
                                className="p-3 hover:bg-gray-200 cursor-pointer"
                                onClick={() => {
                                  handleInputChange({
                                    target: {
                                      name: field.name,
                                      value: option.attribute_value,
                                    },
                                  });
                                  setDropdownState((prev) => ({
                                    ...prev,
                                    [field.name]: false, // Close dropdown
                                  }));
                                }}
                              >
                                {option.attribute_value}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ) : field.attribute_type === "checkbox" ? (
                      <input
                        type="checkbox"
                        id={field.name}
                        name={field.name}
                        checked={!!formData[field.name]}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            [field.name]: e.target.checked,
                          }))
                        }
                        className="w-6 h-8 border rounded text-green "
                      />
                    ) : field.attribute_type === "date" ? (
                      <input
                        type="date"
                        id={field.name}
                        name={field.name}
                        value={formData[field.name] || ""}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded text-black"
                      />
                    ) : null}
                  </li>
                ))}
              </ul>

              {/* Buttons */}
              <div className="flex items-center justify-center gap-x-5 ">
                <button
                  type="submit"
                  disabled={submitting}
                  className={`  ${
                    submitting
                      ? "bg-blue-500 cursor-not-allowed opacity-70"
                      : "secondry-btn"
                  }`}
                >
                  {" "}
                  {submitting ? "در حال ارسال" : " ثبت"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsFormOpen(false);
                    setIsEditing(false);
                    setEditingOrderId(null);
                    setForm1({
                      customer_name: "",
                      order_name: "",
                      designer: decryptData(localStorage.getItem("email")),
                      category: "",
                      status: "pending",
                    });
                    setFormData({});
                    setSelectedCategoryId("");
                  }}
                  className=" py-1.5 bg-red-500 hover:bg-red-600 px-5 rounded-lg  text-white  "
                >
                  لغو
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
      <div className=" w-[300px] sm:w-[45px] md:w-[700px] mt-10 lg:w-[80%] mx-auto overflow-x-scroll    lg:overflow-hidden">
        <table className="w-full  rounded-lg border overflow-auto  border-gray-300 shadow-md">
          <thead>
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
            {orders.slice(0, visibleCount).map((order) => (
              <tr
                key={order.id}
                className="text-center border-b border-gray-200 bg-white hover:bg-gray-200 transition-all"
              >
                <td className="border-gray-300 px-6 py-2 text-gray-700">
                  {order.customer_name}
                </td>
                <td className="border-gray-300 px-6 py-2 text-gray-700">
                  {order.order_name}
                </td>
                <td className="border-gray-300 px-6 py-2 text-gray-700">
                  {categories.find((category) => category.id === order.category)
                    ?.name || "دسته‌بندی نامشخص"}
                </td>
                <td className=" flex items-center justify-center  gap-x-5 border-gray-300 px-6 py-2 text-gray-700">
                  <button
                    onClick={() => handleEdit(order)}
                    className="text-green hover:scale-105 transition-all duration-300"
                  >
                    <FaRegEdit size={24} />
                  </button>
                  <button
                    onClick={() => handleDelete(order.id)}
                    className="text-red-600 hover:scale-105 transition-all duration-300"
                  >
                    <IoTrashSharp size={24} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
      </div>
    </div>
  );
};

export default AddOrder;
