import React, { useState } from "react";

const DropdownFilter = () => {
  const options = [
    "Apple",
    "Banana",
    "Cherry",
    "Grapes",
    "Mango",
    "Orange",
    "Peach",
    "Pineapple",
    "Strawberry",
    "Watermelon",
  ];
  const [query, setQuery] = useState("");
  const [filteredOptions, setFilteredOptions] = useState(options);
  const [isOpen, setIsOpen] = useState(false);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    const startsWithMatch = options.filter((option) =>
      option.toLowerCase().startsWith(value.toLowerCase())
    );
    const includesMatch = options.filter(
      (option) =>
        option.toLowerCase().includes(value.toLowerCase()) &&
        !option.toLowerCase().startsWith(value.toLowerCase())
    );

    setFilteredOptions([...startsWithMatch, ...includesMatch]);
  };

  const handleSelect = (option) => {
    setQuery(option);
    setIsOpen(false);
  };

  return (
    <div className="relative w-64">
      <input
        type="text"
        value={query}
        onChange={handleInputChange}
        onClick={() => setIsOpen(true)}
        placeholder="Search..."
        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {isOpen && (
        <ul className="absolute w-full bg-white border border-gray-300 rounded-md mt-1 shadow-lg max-h-40 overflow-y-auto">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option, index) => (
              <li
                key={index}
                className="p-2 hover:bg-gray-200 cursor-pointer"
                onClick={() => handleSelect(option)}
              >
             {option}
              </li>
            ))
          ) : (
            <li className="p-2 text-gray-500">No options found</li>
          )}
        </ul>
      )}
    </div>
  );
};

export default DropdownFilter;
