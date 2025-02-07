const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    const renderPageNumbers = () => {
      const pageNumbers = []
      const maxVisiblePages = 5
  
      if (totalPages <= maxVisiblePages) {
        for (let i = 1; i <= totalPages; i++) {
          pageNumbers.push(
            <button
              key={i}
              onClick={() => onPageChange(i)}
              className={`px-3 py-1 rounded-md ${
                currentPage === i ? "bg-blue-700 text-white" : "bg-white text-blue-600 hover:bg-blue-100"
              }`}
            >
              {i}
            </button>,
          )
        }
      } else {
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
        const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)
  
        if (endPage - startPage < maxVisiblePages - 1) {
          startPage = Math.max(1, endPage - maxVisiblePages + 1)
        }
  
        if (startPage > 1) {
          pageNumbers.push(
            <button
              key={1}
              onClick={() => onPageChange(1)}
              className="px-3 py-1 rounded-md bg-white text-blue-600 hover:bg-blue-100"
            >
              1
            </button>,
          )
          if (startPage > 2) {
            pageNumbers.push(
              <span key="ellipsis1" className="px-3 py-1">
                ...
              </span>,
            )
          }
        }
  
        for (let i = startPage; i <= endPage; i++) {
          pageNumbers.push(
            <button
              key={i}
              onClick={() => onPageChange(i)}
              className={`px-3 py-1 rounded-md ${
                currentPage === i ? "bg-blue-700 text-white" : "bg-white text-blue-600 hover:bg-blue-100"
              }`}
            >
              {i}
            </button>,
          )
        }
  
        if (endPage < totalPages) {
          if (endPage < totalPages - 1) {
            pageNumbers.push(
              <span key="ellipsis2" className="px-3 py-1">
                ...
              </span>,
            )
          }
          pageNumbers.push(
            <button
              key={totalPages}
              onClick={() => onPageChange(totalPages)}
              className="px-3 py-1 rounded-md bg-white text-blue-600 hover:bg-blue-100"
            >
              {totalPages}
            </button>,
          )
        }
      }
  
      return pageNumbers
    }
  
    return (
      <div className="flex justify-center mt-4">
        <nav className="inline-flex space-x-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            Previous
          </button>
          {renderPageNumbers()}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            Next
          </button>
        </nav>
      </div>
    )
  }
  
  export default Pagination
  
  