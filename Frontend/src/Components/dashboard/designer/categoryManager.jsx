import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { FaChevronDown, FaRegEdit } from "react-icons/fa";
import { IoTrashSharp } from "react-icons/io5";
import Pagination from "../../../Utilities/Pagination";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const CategoryManagement = () => {
  const [categoryName, setCategoryName] = useState("");
  const [roleName, setRoleName] = useState(null);
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [editingCategory, setEditingCategory] = useState(null);
  const [responseMessage, setResponseMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Define role options
  const roles = [
    { id: 3, name: "Head of designers" },
    { id: 4, name: "Printer" },
    { id: 6, name: "Digital" },
    { id: 7, name: "Bill" },
    { id: 8, name: "Chaspak" },
    { id: 9, name: "Shop role" },
    { id: 10, name: "Laser" },
  ];

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

  // Handle form submission (Add / Edit)
  const handleSubmit = async (e) => {
    e.preventDefault();
    const actionType = editingCategory ? "ویرایش" : "اضافه کردن";

    try {
      let response;
      if (editingCategory) {
        response = await axios.put(
          `${BASE_URL}/group/categories/${editingCategory.id}/`,
          {
            name: categoryName,
            role: roles.find(((role) => role.name == roleName)?.id),
          }
        );

        if (response.status === 200) {
          Swal.fire({
            title: "ویرایش موفق!",
            text: "کتگوری با موفقیت ویرایش شد.",
            icon: "success",
            timer: 3000,
            timerProgressBar: true,
          });
          fetchCategories();
          setEditingCategory(null);
        } else {
          throw new Error("ویرایش کتگوری ناموفق بود.");
        }
      } else {
        response = await axios.post(`${BASE_URL}/group/categories/`, {
          name: categoryName,
          role: roles.find((role) => role.name == roleName)?.id,
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
      setRoleName("");
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
    setRoleName(category.role);
    setEditingCategory(category);
  };

  // Handle search
  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    setFilteredCategories(
      term
        ? categories.filter((category) =>
            category.name.toLowerCase().includes(term.toLowerCase())
          )
        : categories
    );
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

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const paginatedCategories = Array.isArray(filteredCategories)
    ? filteredCategories.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
      )
    : [];
  return (
    <div className="py-10 bg-gray-200 w-full min-h-[91vh] px-5">
      <div className="max-w-3xl mx-auto py-4 px-5 shadow-lg bg-white rounded-md">
        <h2 className="text-xl text-center font-bold mb-4">
          {editingCategory ? "ویرایش کتگوری" : "افزودن کتگوری"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-1">
              نام کتگوری
            </label>
            <input
              type="text"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              className="w-full px-3 py-2 border rounded bg-gray-200 text-black focus:outline-none"
              placeholder="نام کتگوری را وارد کنید"
              required
            />
          </div>
          <div className="relative">
            <label className="block text-lg font-medium text-gray-700 mb-1">
              نقش
            </label>
            <div
              className="w-full px-3 py-2 border flex justify-between items-center bg-gray-200 rounded text-black cursor-pointer"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              {roleName || "نقش را انتخاب کنید"}
              <FaChevronDown
                className={`transition-all duration-300 ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </div>
            {isDropdownOpen && (
              <ul className="absolute w-full bg-white text-black border border-gray-300 rounded-md shadow-lg mt-1 z-10">
                {roles.map((role) => (
                  <li
                    key={role.id}
                    className="py-2 px-5 hover:bg-gray-200 cursor-pointer"
                    onClick={() => {
                      setRoleName(role.name);
                      setIsDropdownOpen(false);
                    }}
                  >
                    {role.name}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="flex justify-center gap-4 mt-4">
            <button type="submit" className="btn-primary">
              {editingCategory ? "ویرایش" : "اضافه کردن"}
            </button>
            {editingCategory && (
              <button
                type="button"
                onClick={() => setEditingCategory(null)}
                className="btn-secondary"
              >
                انصراف
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Category List */}
      <div className="w-full max-w-4xl mx-auto mt-10 bg-white shadow-lg rounded-md overflow-hidden">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-green text-gray-100 text-center">
              <th className="border border-gray-300 px-6 py-2.5 text-sm font-semibold">
                نام کتگوری
              </th>
              <th className="border border-gray-300 px-6 py-2.5 text-sm font-semibold">
                نقش
              </th>
              <th className="border border-gray-300 px-6 py-2.5 text-sm font-semibold">
                عملیات
              </th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(paginatedCategories) &&
              paginatedCategories.map((category) => (
                <tr
                  key={category.id}
                  className="text-center border-b border-gray-200 bg-white hover:bg-gray-200 transition-all"
                >
                  <td className="border-gray-300 px-6 py-2 text-gray-700">
                    {category.name}
                  </td>
                  <td className="border-gray-300 px-6 py-2 text-gray-700">
                    {roles.find((role) => role.id == category.role)?.name}
                  </td>
                  <td className="flex items-center justify-center gap-x-5 border-gray-300 px-6 py-2 text-gray-700">
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
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CategoryManagement;
