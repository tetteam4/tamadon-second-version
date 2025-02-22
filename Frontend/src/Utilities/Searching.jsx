import React, { useState } from "react";
import { IoSearch } from "react-icons/io5";

const SearchBar = ({ value, onChange, placeholder }) => {
  const handleSearch = () => {
 
  };

  return (
    <div className="mb-4 flex items-center justify-center">
      <div className="flex items-center border rounded-lg shadow-md overflow-hidden max-w-md w-full">
        <input
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="w-full px-4 py-3 text-gray-700 placeholder-gray-500 focus:outline-none"
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
