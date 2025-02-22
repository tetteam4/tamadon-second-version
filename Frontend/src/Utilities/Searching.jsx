import React, { useState } from "react";
import { IoSearch } from "react-icons/io5";

const SearchBar = ({ value, onChange, placeholder }) => {
  const handleSearch = () => {
    // Trigger the search logic in the parent component
    // This assumes the parent component (DoneList) has the filtering logic.
    // You'll need to pass a function from DoneList to SearchBar to handle this.
    // For example:  <SearchBar onSearch={yourSearchFunction} ... />
  };

  return (
    <div className="mb-4 flex items-center justify-center">
      <div className="flex items-center border rounded-lg shadow-md overflow-hidden max-w-md w-full">
        <input
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="w-full px-4 py-3 text-gray-700 placeholder-gray-500 focus:outline-none" // Removed text-ئی class
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
