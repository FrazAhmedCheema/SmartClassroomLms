import React from 'react';
import { PlusCircle } from "lucide-react"

const EntityHeader = ({ entityType, onAddClick, onImportClick }) => (
  <div className="p-6 border-b border-gray-200 flex justify-between items-center">
    <h2 className="text-2xl font-bold text-gray-800">{entityType}s</h2>
    <div className="flex space-x-4">
      <button
        onClick={onAddClick}
        className="bg-blue-600 text-white px-6 py-2.5 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors"
      >
        <PlusCircle className="w-5 h-5" />
        <span className="font-medium">ADD {entityType.toUpperCase()}</span>
      </button>
      <button
        onClick={onImportClick}
        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
      >
        Import CSV
      </button>
    </div>
  </div>
)

export default EntityHeader

