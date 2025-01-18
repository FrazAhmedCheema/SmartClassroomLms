import React, { useState } from 'react';

import { Home, Users, BookOpen, School, Search, Download, Filter, PlusCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
const ManageInstitutes = () => {
  const navigate = useNavigate();

  const [institutes, setInstitutes] = useState([
    {
      id: 1,
      institute: 'Gift University',
      admin: 'Ayesha',
      Status: 'active'
    }, {
      id: 2,
      institute: 'Punjab University',
      admin: 'Fraz',
      Status: 'active'
    }, {
      id: 3,
      institute: 'TLH college',
      admin: 'Nimra',
      Status: 'active'
    },
    // Add more sample data if needed
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filteredInstitutes, setFilteredInstitutes] = useState(institutes);
  const [editableInstituteId, setEditableInstituteId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    institute: '',
    admin: '',
    Status: ''
  });

  const handleAddUser = () => {
    navigate('/manage-requests');
  };

  const handleFilter = () => {
    const filtered = institutes.filter(institute =>
      institute.institute.toLowerCase().includes(searchTerm.toLowerCase()) ||
      institute.admin.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredInstitutes(filtered);
  };

  const handleEditClick = (institute) => {
    setEditableInstituteId(institute.id);
    setEditFormData({
      institute: institute.institute,
      admin: institute.admin,
      Status: institute.Status
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
    const updatedInstitutes = institutes.map(institute =>
      institute.id === id ? { ...institute, ...editFormData } : institute
    );
    setInstitutes(updatedInstitutes);
    setFilteredInstitutes(updatedInstitutes);
    setEditableInstituteId(null);
  };

  const handleDelete = (id) => {
    const updatedInstitutes = institutes.filter(institute => institute.id !== id);
    setInstitutes(updatedInstitutes);
    setFilteredInstitutes(updatedInstitutes);
    alert(`Delete button clicked for institute ID: ${id}`);
  };

  return (
    <div className="flex h-screen bg-gray-100">


      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="bg-blue-600 p-4 shadow-md">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold text-white">Manage Institutes</h1>
            <div className="flex items-center space-x-2">
              <span className="text-white">ADMIN</span>
              <div className="w-8 h-8 bg-gray-400 rounded-full"></div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-6">
          <div className="bg-white rounded-lg shadow">
            {/* Table Header */}
            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
              <div className="flex items-center space-x-4">
                <h2 className="text-xl font-semibold text-black">Institutes</h2>
                <div className="relative w-64">
                  <input
                    type="text"
                    placeholder="SEARCH"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 bg-white text-black rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Search className="absolute right-3 top-2.5 w-5 h-5 text-gray-500" />
                </div>
                <button onClick={handleFilter} className="flex items-center space-x-2 text-gray-500 hover:text-gray-700 bg-gray-200 px-3 py-2 rounded-full">
                  <Filter className="w-5 h-5" />
                  <span>Search</span>
                </button>
              </div>
              
              <button
                onClick={handleAddUser}
                className="bg-blue-700 text-white px-4 py-2 rounded flex items-center space-x-2"
              >
                <PlusCircle className="w-5 h-5" />
                <span>ADD INSTITUTE</span>
              </button>
            </div>

            {/* Table */}
            <table className="w-full">
              <thead>
                <tr className="bg-white text-gray-800">
                  <th className="px-6 py-3 text-left ">InstituteID</th>
                  <th className="px-6 py-3 text-left">Name</th>
                  <th className="px-6 py-3 text-left">Admin</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-left">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredInstitutes.map((institute) => (
                  <tr key={institute.id} className="border-t text-gray-700">
                    <td className="px-6 py-4">{institute.id}</td>
                    <td className="px-6 py-4">
                      {editableInstituteId === institute.id ? (
                        <input
                          type="text"
                          name="institute"
                          value={editFormData.institute}
                          onChange={handleEditChange}
                          className="w-full px-2 py-1 border rounded bg-white text-black"
                        />
                      ) : (
                        institute.institute
                      )}
                    </td>
                    <td className="px-6 py-4 text-black bg-white">
                      {editableInstituteId === institute.id ? (
                        <input
                          type="text"
                          name="admin"
                          value={editFormData.admin}
                          onChange={handleEditChange}
                          className="w-full px-2 py-1 border rounded bg-white text-black"
                        />
                      ) : (
                        institute.admin
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {editableInstituteId === institute.id ? (
                        <input
                          type="text"
                          name="Status"
                          value={editFormData.Status}
                          onChange={handleEditChange}
                          className="w-full px-2 py-1 border rounded bg-white text-black"
                        />
                      ) : (
                        institute.Status
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        {editableInstituteId === institute.id ? (
                          <button
                            onClick={() => handleSaveClick(institute.id)}
                            className="bg-green-600 text-white px-3 py-1 rounded text-sm"
                          >
                            SAVE
                          </button>
                        ) : (
                          <button
                            onClick={() => handleEditClick(institute)}
                            className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
                          >
                            UPDATE
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(institute.id)}
                          className="bg-red-600 text-white px-3 py-1 rounded text-sm"
                        >
                          DELETE
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ManageInstitutes;