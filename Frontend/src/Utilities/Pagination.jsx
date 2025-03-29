import React from "react";

const Pagination = ({ currentPage, totalOrders, pageSize, onPageChange }) => {
  const totalPages = totalOrders ? Math.ceil(totalOrders / pageSize) : 1; // If totalOrders is 0 or undefined, show 1 page.

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  return (
    <div className="flex justify-center mt-4">
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        className="pagination-btn"
        disabled={currentPage === 1}
      >
        &lt; پیشرفته
      </button>

      <span className="mx-4 text-sm">
        صفحه {currentPage} از {totalPages}
      </span>

      <button
        onClick={() => handlePageChange(currentPage + 1)}
        className="pagination-btn"
        disabled={currentPage === totalPages}
      >
        بعدی &gt;
      </button>
    </div>
  );
};

export default Pagination;
