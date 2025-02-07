import { useState } from "react"

const EntityTableRow = ({ entity, entityType, onEdit, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editFormData, setEditFormData] = useState(entity)

  const handleEditChange = (e) => {
    const { name, value } = e.target
    setEditFormData({ ...editFormData, [name]: value })
  }

  const handleSaveClick = () => {
    onEdit(entity.id, editFormData)
    setIsEditing(false)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditFormData(entity)
  }

  const idField = entityType === "Student" ? "studentId" : "teacherId"

  return (
    <tr className={`border-b border-gray-100 ${isEditing ? "bg-blue-50" : "hover:bg-gray-50"}`}>
      <td className="px-6 py-4 text-sm text-gray-800">{entity[idField]}</td>
      <td className="px-6 py-4 text-sm text-gray-800">
        {isEditing ? (
          <input
            type="text"
            name="name"
            value={editFormData.name}
            onChange={handleEditChange}
            className="w-full px-4 py-2 border-2 border-blue-500 rounded-md 
                       focus:outline-none focus:ring-2 focus:ring-blue-500 
                       bg-white text-gray-800 font-medium"
          />
        ) : (
          <span className="font-medium">{entity.name}</span>
        )}
      </td>
      <td className="px-6 py-4 text-sm text-gray-800">
        {isEditing ? (
          <input
            type="text"
            name="registrationId"
            value={editFormData.registrationId}
            onChange={handleEditChange}
            className="w-full px-4 py-2 border-2 border-blue-500 rounded-md 
                       focus:outline-none focus:ring-2 focus:ring-blue-500 
                       bg-white text-gray-800"
          />
        ) : (
          entity.registrationId
        )}
      </td>
      <td className="px-6 py-4 text-sm text-gray-800">
        {isEditing ? (
          <input
            type="email"
            name="email"
            value={editFormData.email}
            onChange={handleEditChange}
            className="w-full px-4 py-2 border-2 border-blue-500 rounded-md 
                       focus:outline-none focus:ring-2 focus:ring-blue-500 
                       bg-white text-gray-800"
          />
        ) : (
          entity.email
        )}
      </td>
      <td className="px-6 py-4 text-sm text-gray-800">
        {isEditing ? (
          <input
            type="password"
            name="password"
            value={editFormData.password}
            onChange={handleEditChange}
            className="w-full px-4 py-2 border-2 border-blue-500 rounded-md 
                       focus:outline-none focus:ring-2 focus:ring-blue-500 
                       bg-white text-gray-800"
          />
        ) : (
          "••••••" // Show dots instead of actual password
        )}
      </td>
      <td className="px-6 py-4 text-sm">
        {isEditing ? (
          <select
            name="status"
            value={editFormData.status}
            onChange={handleEditChange}
            className="w-full px-4 py-2 border-2 border-blue-500 rounded-md 
                       focus:outline-none focus:ring-2 focus:ring-blue-500 
                       bg-white text-gray-800 cursor-pointer"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        ) : (
          <span
            className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
              entity.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}
          >
            {entity.status}
          </span>
        )}
      </td>
      <td className="px-6 py-4 text-sm">
        <div className="flex space-x-3">
          {isEditing ? (
            <>
              <button
                onClick={handleSaveClick}
                className="bg-green-600 text-white px-6 py-2 rounded-md text-sm 
                           font-medium hover:bg-green-700 transition-colors 
                           shadow-sm hover:shadow-md"
              >
                Save
              </button>
              <button
                onClick={handleCancelEdit}
                className="bg-gray-600 text-white px-6 py-2 rounded-md text-sm 
                           font-medium hover:bg-gray-700 transition-colors 
                           shadow-sm hover:shadow-md"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="bg-blue-600 text-white px-6 py-2 rounded-md text-sm 
                           font-medium hover:bg-blue-700 transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(entity[idField])}
                className="bg-red-600 text-white px-6 py-2 rounded-md text-sm 
                           font-medium hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  )
}

export default EntityTableRow

