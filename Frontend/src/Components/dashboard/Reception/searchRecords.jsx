import React, { useState } from "react";
import { IoSearch } from "react-icons/io5";
import axios from "axios";
const BASE_URL = import.meta.env.VITE_BASE_URL;

const SearchBar = ({ setSearchResults }) => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      alert("لطفاً یک کلمه برای جستجو وارد کنید.");
      return;
    }

    try {
      const response = await axios.get(
        `${BASE_URL}/group/order/?search=${searchQuery}`
      );
      setSearchResults(response.data); // Pass the search results to the parent component
      setSearchQuery("");
    } catch (error) {
      console.error("خطا در جستجو:", error);
      alert("خطایی رخ داده است. لطفاً دوباره تلاش کنید.");
    }
  };

  return (
    <div className="mb-4 flex items-center justify-center">
      <div className="flex items-center border rounded-lg shadow-md overflow-hidden max-w-md w-full">
        <input
          type="text"
          placeholder="کد  سفارش را وارد کنید..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            handleSearch;
          }}
          className="w-full px-4 py-3 text-ئی text-gray-700 placeholder-gray-500 focus:outline-none "
        />
        <button
          onClick={handleSearch}
          className="secondry-btn flex items-center justify-center"
        >
          <IoSearch size={20} />
        </button>
      </div>
    </div>
  );
};

export default SearchBar;
