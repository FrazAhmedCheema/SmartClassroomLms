// import React, { useState } from 'react';
// import { Search, Filter, PlusCircle } from 'lucide-react';
// import { useNavigate } from 'react-router-dom';
// import InstitutesTable from './InstitutesTable';

// const ManageInstitutes = () => {
//   const navigate = useNavigate();

//   const [institutes, setInstitutes] = useState([
//     {
//       id: 1,
//       institute: 'Gift University',
//       admin: 'Ayesha',
//       Status: 'active'
//     }, {
//       id: 2,
//       institute: 'Punjab University',
//       admin: 'Fraz',
//       Status: 'active'
//     }, {
//       id: 3,
//       institute: 'TLH college',
//       admin: 'Nimra',
//       Status: 'active'
//     },
//     // Add more sample data if needed
//   ]);

//   const [searchTerm, setSearchTerm] = useState('');
//   const [filteredInstitutes, setFilteredInstitutes] = useState(institutes);

//   const handleAddUser = () => {
//     navigate('/admin/manage-requests');
//   };

//   const handleFilter = () => {
//     const filtered = institutes.filter(institute =>
//       institute.institute.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       institute.admin.toLowerCase().includes(searchTerm.toLowerCase())
//     );
//     setFilteredInstitutes(filtered);
//   };

//   return (
//     <div className="flex h-screen bg-gray-100">
//       {/* Main Content */}
//       <div className="flex-1 flex flex-col">
//         {/* Top Header */}
//         <header className="bg-blue-600 p-4 shadow-md">
//           <div className="flex justify-between items-center">
//             <h1 className="text-xl font-bold text-white">Manage Institutes</h1>
//             <div className="flex items-center space-x-2">
//               <span className="text-white">ADMIN</span>
//               <div className="w-8 h-8 bg-gray-400 rounded-full"></div>
//             </div>
//           </div>
//         </header>

//         {/* Content Area */}
//         <main className="flex-1 p-6">
//           <div className="bg-white rounded-lg shadow">
//             {/* Table Header */}
//             <div className="p-4 border-b flex justify-between items-center bg-gray-50">
//               <div className="flex items-center space-x-4">
//                 <h2 className="text-xl font-semibold text-black">Institutes</h2>
//                 <div className="relative w-64">
//                   <input
//                     type="text"
//                     placeholder="SEARCH"
//                     value={searchTerm}
//                     onChange={(e) => setSearchTerm(e.target.value)}
//                     className="w-full px-4 py-2 bg-white text-black rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   />
//                   <Search className="absolute right-3 top-2.5 w-5 h-5 text-gray-500" />
//                 </div>
//                 <button onClick={handleFilter} className="flex items-center space-x-2 text-gray-500 hover:text-gray-700 bg-gray-200 px-3 py-2 rounded-full">
//                   <Filter className="w-5 h-5" />
//                   <span>Search</span>
//                 </button>
//               </div>
              
//               <button
//                 onClick={handleAddUser}
//                 className="bg-blue-700 text-white px-4 py-2 rounded flex items-center space-x-2"
//               >
//                 <PlusCircle className="w-5 h-5" />
//                 <span>ADD INSTITUTE</span>
//               </button>
//             </div>

//             {/* Institutes Table */}
//             <InstitutesTable 
//               institutes={filteredInstitutes} 
//               setInstitutes={setInstitutes} 
//               setFilteredInstitutes={setFilteredInstitutes} 
//             />
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// };

// export default ManageInstitutes;


import React, { useState, useEffect } from 'react';
import { Search, Filter, PlusCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import InstitutesTable from './InstitutesTable';

const ManageInstitutes = () => {
  const navigate = useNavigate();

  const [institutes, setInstitutes] = useState([]);
  const [filteredInstitutes, setFilteredInstitutes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchInstitutes = async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(
        `http://localhost:8080/admin/manage-institutes?page=${page}&limit=10`,
        {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      if (!response.ok) {
        throw new Error('Failed to fetch institutes');
      }
      const data = await response.json();
      console.log(data);
      setInstitutes(data.institutes);
      setFilteredInstitutes(data.institutes);
      setTotalPages(data.totalPages);
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
    navigate('/admin/manage-requests');
  };

  const handleSearch = () => {
    const filtered = institutes.filter((institute) =>
      institute.instituteName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredInstitutes(filtered);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="flex-1 flex flex-col">
        <header className="bg-blue-600 p-4 shadow-md">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold text-white">Manage Institutes</h1>
            <div className="flex items-center space-x-2">
              <span className="text-white">ADMIN</span>
              <div className="w-8 h-8 bg-gray-400 rounded-full"></div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6">
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
            ) : (
              <InstitutesTable
                institutes={filteredInstitutes}
                setInstitutes={setInstitutes}
                setFilteredInstitutes={setFilteredInstitutes}
              />
            )}

            {/* Pagination Controls */}
            <div className="flex justify-center space-x-4 p-4">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-gray-800">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ManageInstitutes;
