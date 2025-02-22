import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { FaArrowDown, FaArrowUp } from "react-icons/fa";
import { IoTrashSharp } from "react-icons/io5";
import { FaRegEdit } from "react-icons/fa";
import Pagination from "../../../Utilities/Pagination";
const BASE_URL = import.meta.env.VITE_BASE_URL;

const Category = () => {
  const [categoryName, setCategoryName] = useState("");
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [editingCategory, setEditingCategory] = useState(null);
  const [responseMessage, setResponseMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/group/categories/`);
      setCategories(response.data);
      setFilteredCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Determine action type (edit or add)
    const actionType = editingCategory ? "ویرایش" : "اضافه کردن";
    try {
      let response;
      if (editingCategory) {
        response = await axios.put(
          `${BASE_URL}/group/categories/${editingCategory.id}/`,
          { name: categoryName }
        );

        if (response.status === 200) {
          Swal.fire({
            title: "ویرایش موفق!",
            text: "کتگوری با موفقیت ویرایش شد.",
            icon: "success",
            timer: 3000,
            timerProgressBar: true,
          });
          setEditingCategory(null);
        } else {
          throw new Error("ویرایش کتگوری ناموفق بود.");
        }
      } else {
        response = await axios.post(`${BASE_URL}/group/categories/`, {
          name: categoryName,
        });

        if (response.status === 201) {
          Swal.fire({
            title: "اضافه شد!",
            text: "کتگوری با موفقیت اضافه شد.",
            icon: "success",
            timer: 3000,
            timerProgressBar: true,
          });
        } else {
          throw new Error("اضافه کردن کتگوری ناموفق بود.");
        }
      }

      setCategoryName("");
      fetchCategories();
    } catch (error) {
      Swal.fire({
        title: "خطا",
        text: "خطایی رخ داد. لطفاً دوباره تلاش کنید.",
        icon: "error",
      });
      console.error("Error:", error);
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    const confirmDelete = await Swal.fire({
      title: "آیا مطمئن هستید؟",
      text: "این عملیات قابل بازگشت نیست!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "بله، حذف شود!",
      cancelButtonText: "لغو",
    });

    if (confirmDelete.isConfirmed) {
      try {
        const response = await axios.delete(
          `${BASE_URL}/group/categories/${id}/`
        );
        if (response.status === 204) {
          Swal.fire({
            title: "حذف شد!",
            text: "کتگوری با موفقیت حذف شد.",
            icon: "success",
            timer: 3000,
            timerProgressBar: true,
          });
          fetchCategories();
        } else {
          Swal.fire({
            title: "خطا",
            text: "حذف کتگوری ناموفق بود.",
            icon: "error",
          });
        }
      } catch (error) {
        Swal.fire({
          title: "خطا",
          text: "خطایی رخ داد. لطفاً دوباره تلاش کنید.",
          icon: "error",
        });
        console.error("Error:", error);
      }
    }
  };

  // Handle edit
  const handleEdit = (category) => {
    setCategoryName(category.name);
    setEditingCategory(category);
  };

  // Handle search
  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);

    if (term) {
      setFilteredCategories(
        categories.filter((category) =>
          category.name.toLowerCase().includes(term.toLowerCase())
        )
      );
    } else {
      setFilteredCategories(categories);
    }
  };

  // Handle sort
  const handleSort = () => {
    const sortedCategories = [...filteredCategories].sort((a, b) =>
      sortOrder === "asc"
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name)
    );
    setFilteredCategories(sortedCategories);
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };
  useEffect(() => {
    if (responseMessage || errorMessage) {
      const timer = setTimeout(() => {
        setResponseMessage("");
        setErrorMessage("");
      }, 5000); // Hide messages after 5 seconds

      return () => clearTimeout(timer); // Cleanup timer when component unmounts or when messages change
    }
  }, [responseMessage, errorMessage]);

  //  pagination section
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Calculate pagination
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const paginatedCategories = filteredCategories.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="py-10 bg-gray-200 w-full px-5">
      <div className="max-w-3xl mx-auto p-2  bg-white rounded-md">
        <p className=" md:text-xl text-base text-center font-bold mb-4 ">
          مدیریت کتگوری‌ها
        </p>

        {responseMessage && (
          <p className="mt-4 text-green">{responseMessage}</p>
        )}
        {errorMessage && <p className="mt-4 text-red-600">{errorMessage}</p>}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-2  mt-2 space-y-4">
          <div>
            <label
              htmlFor="categoryName"
              className="block text-md font-medium text-gray-700"
            >
              {editingCategory ? "ویرایش کتگوری" : "نام کتگوری"}
            </label>
            <input
              type="text"
              id="categoryName"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              className="mt-1 block w-full p-2 focus:ring-2 ring-green bg-gray-200 focus:outline-none border-gray-300 rounded-md"
              placeholder="نام کتگوری را وارد کنید"
              required
            />
          </div>
          <div className="flex justify-center items-center gap-x-5">
            <button
              type="submit"
              className={` secondry-btn ${editingCategory ? "bg-green" : ""}`}
            >
              {editingCategory ? "ویرایش" : "اضافه کردن"}
            </button>
            {editingCategory && (
              <button
                type="button"
                onClick={() => {
                  setEditingCategory(null);
                  setCategoryName("");
                }}
                className="tertiary-btn"
              >
                انصراف
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Category List */}
      <div className="w-[400px] md:w-[700px]  mt-10 lg:w-[90%] mx-auto  lg:overflow-hidden">
        <div className=" md:space-y-0 py-1 md:flex items-center px-5 justify-between mb-6">
          <h3 className="text-xl font-Ray_black font-bold text-gray-800">
            لیست کتگوری‌ها
          </h3>
          {/* Search and Sort */}
          <div className="flex items-center space-x-4">
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearch}
              className="m-2 p-2 border border-gray-300 w-[300px] md:w-[400px] focus:outline-none rounded-lg shadow-sm "
              placeholder="جستجوی کتگوری"
            />
            <button
              onClick={handleSort}
              className="secondry-btn flex items-center gap-x-2"
            >
              مرتب‌سازی {sortOrder === "asc" ? <FaArrowUp /> : <FaArrowDown />}
            </button>
          </div>
        </div>
        <div className="bg-white p-5 rounded-md">
          <ul className="mt-4 space-y-2 ">
            {paginatedCategories.length > 0 ? (
              paginatedCategories.map((category) => (
                <li
                  key={category.id}
                  className="px-4 py-2 border  border-gray-300 rounded-md  hover:bg-gray-200 flex justify-between gap-x-5 items-center"
                >
                  <span className="font-bold text-base">{category.name}</span>
                  <div className="flex items-center gap-x-5">
                    <button
                      onClick={() => handleEdit(category)}
                      className="text-green hover:scale-105 transition-all duration-300"
                    >
                      <FaRegEdit size={24} />
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="text-red-600 hover:scale-105 transition-all duration-300"
                    >
                      <IoTrashSharp size={24} />
                    </button>
                  </div>
                </li>
              ))
            ) : (
              <p className="text-gray-600">هیچ کتگوری موجود نیست.</p>
            )}
          </ul>
        </div>
        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
    </div>
  );
};

export default Category;
