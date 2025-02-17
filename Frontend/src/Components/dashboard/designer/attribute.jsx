import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { FaChevronDown } from "react-icons/fa";
import { IoTrashSharp } from "react-icons/io5";
import { FaRegEdit } from "react-icons/fa";
const BASE_URL = import.meta.env.VITE_BASE_URL;

const Attribute = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [attributeTypes, setAttributeTypes] = useState([
    "dropdown",
    "input",
    "date",
    "checkbox",
  ]);
  const [attribute, setAttribute] = useState("");
  const [shownAttributes, setShownAttributes] = useState([]);
  const [type, setType] = useState("");
  const [editingAttributeId, setEditingAttributeId] = useState(null);

  const [responseMessage, setResponseMessage] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedType, setSelectedType] = useState(""); // To store the selected type
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false); // To toggle the dropdown

  const handleSelect = (category) => {
    setSelectedCategory(category.id);
    setIsDropdownOpen(false);
  };
  // Fetch categories from the API
  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/group/categories/`);
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };
  const handleTypeSelect = (selectedType) => {
    setType(selectedType);
    setIsTypeDropdownOpen(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch attributes based on selected category
  useEffect(() => {
    if (selectedCategory) {
      const fetchAttributes = async () => {
        try {
          const response = await axios.get(
            `${BASE_URL}/group/category/attribute/${selectedCategory}`
          );
          const { attribute_types } = response.data;
          setShownAttributes(attribute_types);
        } catch (error) {
          console.error("Error fetching attributes:", error);
        }
      };
      fetchAttributes();
    } else {
      setShownAttributes([]);
    }
  }, [selectedCategory]);

  // Handle form submission (Add or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prepare the data
    const data = {
      name: attribute,
      attribute_type: type, // Send the ID of the selected attribute type
      category: selectedCategory, // Send the ID of the selected category
    };

    try {
      let response;
      let successMessage = "";

      if (editingAttributeId) {
        // Update the existing attribute
        console.log(data);
        response = await axios.put(
          `${BASE_URL}/group/attribute-types/${editingAttributeId}/`,
          data
        );
        if (response.status === 200) {
          successMessage = "ویژگی با موفقیت ویرایش شد.";
        } else {
          throw new Error("مشکلی در ویرایش ویژگی وجود دارد.");
        }
      } else {
        // Add a new attribute
        console.log(data);

        response = await axios.post(`${BASE_URL}/group/attribute-types/`, data);

        if (response.status === 201) {
          successMessage = "اطلاعات با موفقیت ثبت شد.";
        } else {
          throw new Error("مشکلی در ارسال اطلاعات وجود دارد.");
        }
      }

      // Show success Swal
      Swal.fire({
        title: "موفقیت‌آمیز!",
        text: successMessage,
        icon: "success",
        timer: 3000,
        timerProgressBar: true,
      });

      // Clear the form
      setSelectedCategory("");
      setAttribute("");
      setType("");
      setEditingAttributeId(null);

      // Refresh the list of attributes
      const fetchAttributes = await axios.get(
        `${BASE_URL}/group/category/attribute/${selectedCategory}`
      );
      setShownAttributes(fetchAttributes.data.attribute_types);
    } catch (error) {
      console.error("Error sending data:", error);

      // Show error Swal
      Swal.fire({
        title: "خطا!",
        text: "ارسال اطلاعات با خطا مواجه شد.",
        icon: "error",
        timer: 3000,
        timerProgressBar: true,
      });
    }
  };

  // Handle attribute deletion
  const handleDelete = async (id) => {
    // Show confirmation alert
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

    if (!confirmDelete.isConfirmed) return;

    try {
      await axios.delete(`${BASE_URL}/group/attribute-types/${id}/`);

      // Remove deleted attribute from state
      setShownAttributes((prev) => prev.filter((attr) => attr.id !== id));

      // Show success alert
      Swal.fire({
        title: "حذف شد!",
        text: "ویژگی با موفقیت حذف شد.",
        icon: "success",
        timer: 3000,
        timerProgressBar: true,
      });
    } catch (error) {
      console.error("Error deleting attribute:", error);

      // Show error alert
      Swal.fire({
        title: "خطا!",
        text: "حذف ویژگی با خطا مواجه شد.",
        icon: "error",
        timer: 3000,
        timerProgressBar: true,
      });
    }
  };

  // Handle attribute editing
  const handleEdit = (attr) => {
    setEditingAttributeId(attr.id);
    setAttribute(attr.name);
    setType(attr.attribute_type);
    setSelectedCategory(attr.category);
  };

  return (
    <div className=" p-4 mt-10 max-w-lg mx-auto bg-white shadow-md rounded-md">
      <h2 className="text-lg font-bold mb-4">انتخاب کتگوری و ویژگی‌ها</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Select Category */}
        <div>
         
          <div className="w-full">
            <label htmlFor="category" className="block font-medium mb-2">
              دسته‌بندی
            </label>
            <div className="">
              {/* Dropdown Button */}
              <div
                className="mt-1  bg-gray-200 w-full p-2 flex justify-between items-center border border-gray-300 rounded-md shadow-sm focus:ring-blue-500  cursor-pointer"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                {selectedCategory
                  ? categories.find((cat) => cat.id === selectedCategory)
                      ?.name || "-- لطفاً  کتگوری راانتخاب کنید --"
                  : "لطفاً  کتگوری راانتخاب کنید "}
                <FaChevronDown className={` transition-all duration-300 ${
                  isDropdownOpen ? "rotate-180" :""
                }`} />
              </div>

              {/* Dropdown List */}
              {isDropdownOpen && (
                <ul className=" w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1 z-10">
                
                  {categories.map((category) => (
                    <li
                      key={category.id}
                      className="p-2 hover:bg-gray-200 border-b cursor-pointer"
                      onClick={() => handleSelect(category)}
                    >
                      {category.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Attribute Input */}
        <div>
          <label
            htmlFor="attribute"
            className="block text-sm font-medium text-gray-700"
          >
            ویژگی
          </label>
          <input
            type="text"
            id="attribute"
            value={attribute}
            onChange={(e) => setAttribute(e.target.value)}
            placeholder="ویژگی را وارد کنید"
            className="mt-1 block w-full p-2 bg-gray-200 border-gray-300 rounded-md shadow-sm focus:ring-green"
            required
          />
        </div>

        {/* Type Dropdown */}
        <div>
          <div className="w-full">
            <label htmlFor="type" className="block font-medium mb-2">
              نوع
            </label>
            <div className="">
              {/* Dropdown Button */}
              <div
                className="mt-1 flex justify-between  w-full p-2 border bg-gray-200 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
                onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
              >
                {type || "-- لطفاً انتخاب کنید --"}
                <FaChevronDown className={` transition-all duration-300 ${
                  isTypeDropdownOpen ? "rotate-180" :""
                }`} />
              </div>

              {/* Dropdown List */}
              {isTypeDropdownOpen && (
                <ul className=" w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1 z-10">
                 
                  {attributeTypes.map((attributeType) => (
                    <li
                      key={attributeType}
                      className="p-2 hover:bg-gray-200 border-b cursor-pointer"
                      onClick={() => handleTypeSelect(attributeType)}
                    >
                      {attributeType}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-center md:block">
          <button type="submit " className="secondry-btn">
            {editingAttributeId ? "ویرایش" : "ارسال"}
          </button>
        </div>
      </form>

      <ul className="mt-4 space-y-2">
        {shownAttributes.length > 0 ? (
          shownAttributes.map((attr) => (
            <li
              key={attr.id}
              className="px-4 py-2 hover:bg-gray-200 border border-gray-300 rounded-md flex justify-between items-center"
            >
              <span>{attr.name}</span>
              {/* Map attribute_type ID to the corresponding name */}
              <span>{attr.attribute_type || "نامشخص"}</span>
              <div className="flex gap-x-5 items-center">
                <button
                  onClick={() => handleEdit(attr)}
                  className="text-green hover:scale-105 transition-all duration-300"
                >
                 <FaRegEdit size={24} />
                </button>
                <button
                  onClick={() => handleDelete(attr.id)}
                 className="text-red-600 hover:scale-105 transition-all duration-300"
                >
                  <IoTrashSharp size={24} />
                </button>
              </div>
            </li>
          ))
        ) : (
          <p className="text-gray-600">هیچ ویژگی موجود نیست.</p>
        )}
      </ul>
    </div>
  );
};

export default Attribute;
