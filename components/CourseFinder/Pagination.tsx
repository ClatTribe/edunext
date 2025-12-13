import React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface PaginationProps {
  totalItems: number
  currentPage: number
  perPage: number
  onPageChange: (page: number) => void
}

// Color scheme matching the home page
const accentColor = '#6366f1' // Indigo accent
const primaryBg = '#0a0f1e' // Very dark navy blue
const secondaryBg = '#111827' // Slightly lighter navy
const borderColor = 'rgba(99, 102, 241, 0.15)' // Indigo border with opacity

const Pagination: React.FC<PaginationProps> = ({ totalItems, currentPage, perPage, onPageChange }) => {
  const totalPages = Math.ceil(totalItems / perPage)

  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisible = 5

    if (totalPages <= maxVisible) {
      for (let i = 0; i < totalPages; i++) pages.push(i)
    } else {
      if (currentPage <= 2) {
        for (let i = 0; i < 4; i++) pages.push(i)
        pages.push("...")
        pages.push(totalPages - 1)
      } else if (currentPage >= totalPages - 3) {
        pages.push(0)
        pages.push("...")
        for (let i = totalPages - 4; i < totalPages; i++) pages.push(i)
      } else {
        pages.push(0)
        pages.push("...")
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i)
        pages.push("...")
        pages.push(totalPages - 1)
      }
    }

    return pages
  }

  const handlePageChange = (page: number) => {
    onPageChange(page)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  if (totalPages <= 1) return null

  return (
    <div 
      className="mt-8 rounded-lg shadow-lg p-6 backdrop-blur-xl"
      style={{ 
        backgroundColor: secondaryBg, 
        border: `1px solid ${borderColor}` 
      }}
    >
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-sm text-slate-400">
          Showing <span className="font-semibold text-white">{currentPage * perPage + 1}</span> to{" "}
          <span className="font-semibold text-white">{Math.min((currentPage + 1) * perPage, totalItems)}</span> of{" "}
          <span className="font-semibold text-white">{totalItems.toLocaleString()}</span> colleges
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 0}
            className={`px-3 py-2 rounded-lg flex items-center gap-1 transition-all ${
              currentPage === 0
                ? "cursor-not-allowed opacity-40"
                : "hover:bg-white/5"
            }`}
            style={
              currentPage === 0
                ? { border: `1px solid ${borderColor}`, color: '#64748b' }
                : { border: `1px solid ${borderColor}`, color: '#cbd5e1' }
            }
          >
            <ChevronLeft size={16} />
            <span className="hidden sm:inline">Previous</span>
          </button>
          <div className="flex items-center gap-1">
            {getPageNumbers().map((page, index) => (
              <React.Fragment key={index}>
                {page === "..." ? (
                  <span className="px-3 py-2 text-slate-500">...</span>
                ) : (
                  <button
                    onClick={() => handlePageChange(page as number)}
                    className="min-w-[40px] px-3 py-2 rounded-lg transition-all"
                    style={
                      currentPage === page
                        ? { 
                            backgroundColor: accentColor, 
                            color: 'white', 
                            border: `1px solid ${accentColor}`,
                            boxShadow: '0 0 20px rgba(99, 102, 241, 0.3)'
                          }
                        : { 
                            border: `1px solid ${borderColor}`, 
                            color: '#cbd5e1',
                            backgroundColor: 'transparent'
                          }
                    }
                    onMouseEnter={(e) => {
                      if (currentPage !== page) {
                        e.currentTarget.style.backgroundColor = 'rgba(99, 102, 241, 0.1)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (currentPage !== page) {
                        e.currentTarget.style.backgroundColor = 'transparent'
                      }
                    }}
                  >
                    {(page as number) + 1}
                  </button>
                )}
              </React.Fragment>
            ))}
          </div>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages - 1}
            className={`px-3 py-2 rounded-lg flex items-center gap-1 transition-all ${
              currentPage === totalPages - 1
                ? "cursor-not-allowed opacity-40"
                : "hover:bg-white/5"
            }`}
            style={
              currentPage === totalPages - 1
                ? { border: `1px solid ${borderColor}`, color: '#64748b' }
                : { border: `1px solid ${borderColor}`, color: '#cbd5e1' }
            }
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default Pagination