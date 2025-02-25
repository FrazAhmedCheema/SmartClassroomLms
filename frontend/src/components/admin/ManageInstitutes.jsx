import React, { useState, useEffect } from 'react';
import { Search, Filter, PlusCircle, ArrowLeft, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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
        if (response.status === 401 || response.status === 403) {
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

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    const filtered = institutes.filter((institute) =>
      institute.instituteName.toLowerCase().includes(e.target.value.toLowerCase())
    );
    setFilteredInstitutes(filtered);
  };

  const handleBack = () => {
    navigate('/admin/dashboard');
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#e6f0ff" }}>
      <AdminNavbar title="Manage Institutes" />
      <main className="p-4 md:p-6 pt-8">
        {/* Back to Dashboard Button */}
        <div className="mb-4">
          <button
            onClick={handleBack}
            className="flex items-center space-x-2 text-white hover:text-[#1b68b3] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-xl shadow-md overflow-hidden"
          >
            {/* Header Section */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                <div className="flex items-center space-x-3">
                  <Building2 className="w-8 h-8 text-[#1b68b3]" />
                  <div className="flex flex-col space-y-2">
                    <h1 className="text-2xl font-bold text-[#1b68b3] flex items-center">
                      <Building2 className="w-7 h-7 mr-2" />
                      Institutes Management
                    </h1>
                    <p className="text-gray-600">Manage all institutes in the system</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search institutes..."
                      value={searchTerm}
                      onChange={handleSearch}
                      className="w-full px-4 py-2 pl-10 rounded-lg border-2 border-[#1b68b3] 
                               focus:border-[#154d85] focus:outline-none transition-all
                               bg-white text-gray-600 placeholder-gray-400"
                    />
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
                  </div>
                  <button
                    onClick={handleAddInstitute}
                    className="px-4 py-2 bg-[#1b68b3] text-white rounded-lg hover:bg-[#154d85] transition-all flex items-center space-x-2"
                  >
                    <PlusCircle size={20} />
                    <span>Add Institute</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="p-6">
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : error ? (
                <div className="text-center py-8 text-red-500">{error}</div>
              ) : message ? (
                <div className="text-center py-8 text-gray-500">{message}</div>
              ) : (
                <div className="overflow-x-auto">
                  <InstitutesTable
                    institutes={filteredInstitutes}
                    setInstitutes={setInstitutes}
                    setFilteredInstitutes={setFilteredInstitutes}
                  />
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center space-x-4 mt-6">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg disabled:opacity-50 hover:bg-gray-200 transition-all"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2 bg-white text-gray-800 rounded-lg">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg disabled:opacity-50 hover:bg-gray-200 transition-all"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
};

export default ManageInstitutes;

