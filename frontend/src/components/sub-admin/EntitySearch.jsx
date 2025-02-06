import { Search } from "lucide-react"

const EntitySearch = ({ searchTerm, onSearchChange, entityType }) => (
  <div className="px-6 py-4 border-b border-gray-200">
    <div className="relative w-72">
      <input
        type="text"
        placeholder={`Search ${entityType.toLowerCase()}s...`}
        value={searchTerm}
        onChange={onSearchChange}
        className="w-full px-4 py-2.5 bg-white rounded-lg border-2 border-gray-300 
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                   text-gray-900 text-base font-medium placeholder-gray-500"
      />
      <Search className="absolute right-3 top-3 w-5 h-5 text-gray-500" />
    </div>
  </div>
)

export default EntitySearch

