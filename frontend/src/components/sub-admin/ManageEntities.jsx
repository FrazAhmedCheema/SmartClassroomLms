import React, { useState, useEffect } from 'react';
import { Search, PlusCircle } from 'lucide-react';
import Swal from 'sweetalert2';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import AddEntityModal from './AddEntityModal';

const ManageEntities = ({ entityType, entitiesData }) => {
  const [entities, setEntities] = useState(entitiesData);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredEntities, setFilteredEntities] = useState(entities);
  const [editableEntityId, setEditableEntityId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    rollNo: '',
    email: '',
    password: '',
    status: ''
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const entitiesPerPage = 5;

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    const filtered = entities.filter(entity =>
      entity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entity.rollNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entity.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredEntities(filtered);
  }, [searchTerm, entities]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleEditClick = (entity) => {
    Swal.fire({
      title: `Edit ${entityType}`,
      text: `Do you want to edit ${entity.name}'s information?`,
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, edit!',
      cancelButtonText: 'Cancel',
      background: '#fff',
      borderRadius: '1rem',
      customClass: {
        title: 'text-xl font-bold text-gray-800',
        content: 'text-md text-gray-600',
        confirmButton: 'px-4 py-2 text-white rounded-lg text-sm font-medium',
        cancelButton: 'px-4 py-2 text-white rounded-lg text-sm font-medium'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        setEditableEntityId(entity.id);
        setEditFormData({
          name: entity.name,
          rollNo: entity.rollNo,
          email: entity.email,
          password: entity.password,
          status: entity.status
        });
      }
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: value
    });
  };

  const handleSaveClick = (id) => {
    Swal.fire({
      title: 'Save Changes?',
      text: 'Do you want to save the changes made to this entity?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, save it!',
      cancelButtonText: 'Cancel',
      background: '#fff',
      borderRadius: '1rem',
      customClass: {
        title: 'text-xl font-bold text-gray-800',
        content: 'text-md text-gray-600',
        confirmButton: 'px-4 py-2 text-white rounded-lg text-sm font-medium',
        cancelButton: 'px-4 py-2 text-white rounded-lg text-sm font-medium'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const updatedEntities = entities.map(entity =>
          entity.id === id ? { ...entity, ...editFormData } : entity
        );
        setEntities(updatedEntities);
        setFilteredEntities(updatedEntities);
        setEditableEntityId(null);

        Swal.fire({
          title: 'Saved!',
          text: `${entityType} information has been updated successfully.`,
          icon: 'success',
          confirmButtonColor: '#3085d6',
          timer: 1500,
          customClass: {
            title: 'text-xl font-bold text-gray-800',
            content: 'text-md text-gray-600',
            confirmButton: 'px-4 py-2 text-white rounded-lg text-sm font-medium'
          }
        });
      }
    });
  };

  const handleDelete = (id) => {
    const entityToDelete = entities.find(entity => entity.id === id);
    
    Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to delete ${entityToDelete.name}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete!',
      cancelButtonText: 'Cancel',
      background: '#fff',
      borderRadius: '1rem',
      customClass: {
        title: 'text-xl font-bold text-gray-800',
        content: 'text-md text-gray-600',
        confirmButton: 'px-4 py-2 text-white rounded-lg text-sm font-medium',
        cancelButton: 'px-4 py-2 text-white rounded-lg text-sm font-medium'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const updatedEntities = entities.filter(entity => entity.id !== id);
        setEntities(updatedEntities);
        setFilteredEntities(updatedEntities);
        
        Swal.fire({
          title: 'Deleted!',
          text: `${entityType} has been deleted successfully.`,
          icon: 'success',
          confirmButtonColor: '#3085d6',
          timer: 1500,
          customClass: {
            title: 'text-xl font-bold text-gray-800',
            content: 'text-md text-gray-600',
            confirmButton: 'px-4 py-2 text-white rounded-lg text-sm font-medium'
          }
        });
      }
    });
  };

  const handleAddEntity = (formData) => {
    const newEntity = {
      id: entities.length + 1,
      ...formData
    };

    setEntities([...entities, newEntity]);
    setFilteredEntities([...entities, newEntity]);
    setIsAddModalOpen(false);

    Swal.fire({
      title: 'Success!',
      text: `${entityType} added successfully`,
      icon: 'success',
      timer: 1500,
      showConfirmButton: false
    });
  };

  // Pagination logic
  const indexOfLastEntity = currentPage * entitiesPerPage;
  const indexOfFirstEntity = indexOfLastEntity - entitiesPerPage;
  const currentEntities = filteredEntities.slice(indexOfFirstEntity, indexOfLastEntity);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const renderPageNumbers = () => {
    const pageNumbers = [];
    const totalPages = Math.ceil(filteredEntities.length / entitiesPerPage);

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(
          <button
            key={i}
            onClick={() => paginate(i)}
            className={`px-3 py-1 rounded-md ${currentPage === i ? 'bg-blue-700 text-white' : 'bg-white text-blue-600 hover:bg-blue-100'}`}
          >
            {i}
          </button>
        );
      }
    } else {
      if (currentPage > 3) {
        pageNumbers.push(
          <button
            key={1}
            onClick={() => paginate(1)}
            className="px-3 py-1 rounded-md bg-white text-blue-600 hover:bg-blue-100"
          >
            1
          </button>
        );
        pageNumbers.push(<span key="ellipsis1" className="px-3 py-1">...</span>);
      }

      const startPage = Math.max(1, currentPage - 2);
      const endPage = Math.min(totalPages, currentPage + 2);

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(
          <button
            key={i}
            onClick={() => paginate(i)}
            className={`px-3 py-1 rounded-md ${currentPage === i ? 'bg-blue-700 text-white' : 'bg-white text-blue-600 hover:bg-blue-100'}`}
          >
            {i}
          </button>
        );
      }

      if (currentPage < totalPages - 2) {
        pageNumbers.push(<span key="ellipsis2" className="px-3 py-1">...</span>);
        pageNumbers.push(
          <button
            key={totalPages}
            onClick={() => paginate(totalPages)}
            className="px-3 py-1 rounded-md bg-white text-blue-600 hover:bg-blue-100"
          >
            {totalPages}
          </button>
        );
      }
    }

    return pageNumbers;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <Sidebar />
      
      <div className="ml-64 pt-16">
        <main className="p-6">
          <div className="bg-white rounded-lg shadow-lg">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-white">
              <div className="flex items-center space-x-6">
                <h2 className="text-2xl font-bold text-gray-800">{entityType}s</h2>
                <div className="relative w-72">
                  <input
                    type="text"
                    placeholder={`Search ${entityType.toLowerCase()}s...`}
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="w-full px-4 py-2.5 bg-white rounded-lg border-2 border-gray-300 
                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                             text-gray-900 text-base font-medium placeholder-gray-500"
                  />
                  <Search className="absolute right-3 top-3 w-5 h-5 text-gray-500" />
                </div>
              </div>
              
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="bg-blue-600 text-white px-6 py-2.5 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors"
              >
                <PlusCircle className="w-5 h-5" />
                <span className="font-medium">ADD {entityType.toUpperCase()}</span>
              </button>
            </div>

            <div className="px-6 py-2 text-sm text-gray-600 border-b">
              {searchTerm ? (
                <span>Found {filteredEntities.length} results for "{searchTerm}"</span>
              ) : (
                <span>Total {entities.length} {entityType.toLowerCase()}s</span>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">ID</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Name</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Roll No</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Email</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Password</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentEntities.map((entity) => (
                    <tr key={entity.id} className={`border-b border-gray-100 ${
                      editableEntityId === entity.id ? 'bg-blue-50' : 'hover:bg-gray-50'
                    }`}>
                      <td className="px-6 py-4 text-sm text-gray-800">{entity.id}</td>
                      <td className="px-6 py-4 text-sm text-gray-800">
                        {editableEntityId === entity.id ? (
                          <div className="relative">
                            <input
                              type="text"
                              name="name"
                              value={editFormData.name}
                              onChange={handleEditChange}
                              className="w-full px-4 py-2 border-2 border-blue-500 rounded-md 
                                       focus:outline-none focus:ring-2 focus:ring-blue-500 
                                       bg-white text-gray-800 font-medium"
                              autoFocus
                            />
                          </div>
                        ) : (
                          <span className="font-medium">{entity.name}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-800">
                        {editableEntityId === entity.id ? (
                          <input
                            type="text"
                            name="rollNo"
                            value={editFormData.rollNo}
                            onChange={handleEditChange}
                            className="w-full px-4 py-2 border-2 border-blue-500 rounded-md 
                                     focus:outline-none focus:ring-2 focus:ring-blue-500 
                                     bg-white text-gray-800"
                          />
                        ) : (
                          entity.rollNo
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-800">
                        {editableEntityId === entity.id ? (
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
                        {editableEntityId === entity.id ? (
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
                          '••••••' // Show dots instead of actual password
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {editableEntityId === entity.id ? (
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
                          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                            entity.status === 'active' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {entity.status}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex space-x-3">
                          {editableEntityId === entity.id ? (
                            <button
                              onClick={() => handleSaveClick(entity.id)}
                              className="bg-green-600 text-white px-6 py-2 rounded-md text-sm 
                                       font-medium hover:bg-green-700 transition-colors 
                                       shadow-sm hover:shadow-md"
                            >
                              Save
                            </button>
                          ) : (
                            <button
                              onClick={() => handleEditClick(entity)}
                              className="bg-blue-600 text-white px-6 py-2 rounded-md text-sm 
                                       font-medium hover:bg-blue-700 transition-colors"
                            >
                              Edit
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(entity.id)}
                            className="bg-red-600 text-white px-6 py-2 rounded-md text-sm 
                                     font-medium hover:bg-red-700 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex justify-center mt-4">
              <nav className="inline-flex space-x-2">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  Previous
                </button>
                {renderPageNumbers()}
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === Math.ceil(filteredEntities.length / entitiesPerPage)}
                  className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </main>
      </div>

      <AddEntityModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddEntity}
        entityType={entityType}
      />
    </div>
  );
};

export default ManageEntities;