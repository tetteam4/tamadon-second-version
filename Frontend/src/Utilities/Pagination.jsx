import React from "react";

const Pagination = ({ currentPage, totalOrders, pageSize, onPageChange }) => {
  const totalPages = totalOrders ? Math.ceil(totalOrders / pageSize) : 1;

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  return (
    <div className="flex justify-center items-center gap-3 mt-4">
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1 bg-gray-300 rounded-md hover:bg-gray-400 disabled:opacity-50"
      >
        « قبلی
      </button>

      <span>
        صفحه {currentPage} از {totalPages}
      </span>

      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-1 bg-gray-300 rounded-md hover:bg-gray-400 disabled:opacity-50"
      >
        بعدی »
      </button>
    </div>
  );
};

export default Pagination;
