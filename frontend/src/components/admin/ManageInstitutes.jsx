import React, { useState, useEffect } from 'react';
import { Search, Filter, PlusCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AdminNavbar from './AdminNavbar';
import InstitutesTable from './InstitutesTable';
import Swal from 'sweetalert2';

const ManageInstitutes = () => {
  const navigate = useNavigate();
  const [institutes, setInstitutes] = useState([]);
  const [filteredInstitutes, setFilteredInstitutes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const fetchInstitutes = async (page = 1) => {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const response = await fetch(
        `http://localhost:8080/admin/manage-institutes?page=${page}&limit=10`,
        {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        }
      );
      if (!response.ok) {
        if (response.status === 401) {
          navigate('/admin/login');
          throw new Error('Unauthorized');
        }
        throw new Error('Failed to fetch institutes');
      }
      const data = await response.json();
      setInstitutes(data.institutes);
      setFilteredInstitutes(data.institutes);
      setTotalPages(data.totalPages);
      if (data.institutes.length === 0) setMessage('No institutes found.');
    } catch (error) {
      console.error(error.message);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstitutes(currentPage);
  }, [currentPage]);

  const handleAddInstitute = () => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to navigate to manage requests?',
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, navigate!',
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
        navigate('/admin/manage-requests');
      }
    });
  };

  const handleSearch = () => {
    const filtered = institutes.filter((institute) =>
      institute.instituteName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredInstitutes(filtered);
  };

  const handleBack = () => {
    navigate('/admin/dashboard');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="flex-1 flex flex-col">
        <AdminNavbar title="Manage Institutes" />
        <main className="flex-1 p-6">
          <div className="mb-6">
            <button
              onClick={handleBack}
              className="flex items-center text-gray-700 hover:text-blue-600 px-3 py-2 rounded-lg transition-colors bg-white shadow-sm hover:bg-gray-50"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Dashboard
            </button>
          </div>

          <div className="bg-white rounded-lg shadow">
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
                <button
                  onClick={handleSearch}
                  className="flex items-center space-x-2 text-gray-500 hover:text-gray-700 bg-gray-200 px-3 py-2 rounded-full"
                >
                  <Filter className="w-5 h-5" />
                  <span>Search</span>
                </button>
              </div>
              <button
                onClick={handleAddInstitute}
                className="bg-blue-700 text-white px-4 py-2 rounded flex items-center space-x-2"
              >
                <PlusCircle className="w-5 h-5" />
                <span>ADD INSTITUTE</span>
              </button>
            </div>

            {loading ? (
              <p className="text-center py-4">Loading...</p>
            ) : error ? (
              <p className="text-center py-4 text-red-500">{error}</p>
            ) : message ? (
              <p className="text-center py-4 text-gray-500">{message}</p>
            ) : (
              <InstitutesTable
                institutes={filteredInstitutes}
                setInstitutes={setInstitutes}
                setFilteredInstitutes={setFilteredInstitutes}
              />
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center space-x-4 p-4">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-gray-800">Page {currentPage} of {totalPages}</span>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ManageInstitutes;
