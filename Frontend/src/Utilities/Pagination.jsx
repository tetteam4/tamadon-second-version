import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const getPaginationButtons = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1, 2);
      if (currentPage > 4) pages.push("...");
      for (
        let i = Math.max(3, currentPage - 1);
        i <= Math.min(totalPages - 2, currentPage + 1);
        i++
      ) {
        pages.push(i);
      }
      if (currentPage < totalPages - 3) pages.push("...");
      pages.push(totalPages - 1, totalPages);
    }
    return pages;
  };

  return (
    <div className="flex justify-center items-center space-x-2 mt-6">
      {/* Previous Button */}
      <button
        className={`px-2 py-1 text-xs flex ml-2 items-center gap-x-1 rounded-md border border-green ${
          currentPage === 1
            ? "cursor-not-allowed text-gray-400 bg-gray-200"
            : "text-gray-100 bg-green"
        }`}
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        <FaChevronRight />
        قبلی
      </button>

      {/* Page Numbers */}
      {getPaginationButtons().map((page, index) =>
        page === "..." ? (
          <span key={index} className="px-2 py-1 text-xs text-gray-600">
            ...
          </span>
        ) : (
          <button
            key={page}
            className={`px-2 py-1 text-xs rounded-md border shadow-md ${
              currentPage === page
                ? "bg-green text-white border-green"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
            onClick={() => onPageChange(page)}
          >
            {page}
          </button>
        )
      )}

      {/* Next Button */}
      <button
        className={`px-2 py-1 text-xs flex items-center gap-x-1 rounded-md border border-green ${
          currentPage === totalPages
            ? "cursor-not-allowed text-gray-400 bg-gray-200"
            : "text-gray-100 bg-green"
        }`}
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        بعدی
        <FaChevronLeft />
      </button>
    </div>
  );
};

export default Pagination;
