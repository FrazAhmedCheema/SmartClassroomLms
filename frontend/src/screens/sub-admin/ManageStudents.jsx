import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaUserGraduate, FaSearch, FaPlus, FaFileImport } from 'react-icons/fa';
import useMediaQuery from '../../hooks/useMediaQuery';
import EntityManager from "../../components/sub-admin/EntityManager";
import Navbar from "../../components/sub-admin/Navbar";
import Sidebar from "../../components/sub-admin/Sidebar";

const ManageStudents = () => {
  const isMobile = useMediaQuery('(max-width: 1024px)');
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile);
  const [studentsData, setStudentsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  useEffect(() => {
    setIsSidebarOpen(!isMobile);
  }, [isMobile]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch("http://localhost:8080/sub-admin/students",{
          credentials : 'include',
          headers :{
            "Content-Type": "application/json",
            
          }
        })
        if (!response.ok) {
          throw new Error("Failed to fetch students")
        }
        const data = await response.json()
        // Transform the data to match the desired structure
        const transformedData = data.data.map((student) => ({
          ...student,
          id: student.studentId,
        }))
        setStudentsData(transformedData)
      } catch (error) {
        navigate('/sub-admin/login');
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchStudents()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#1b68b3] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading students data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center text-red-600">
          <p className="text-xl font-semibold">Error: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-[#1b68b3] text-white rounded-lg hover:bg-[#154d85] transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar 
        toggleSidebar={toggleSidebar}
        isSidebarOpen={isSidebarOpen}
        isMobile={isMobile}
      />
      <Sidebar 
        isOpen={isSidebarOpen} 
        toggle={toggleSidebar}
        isMobile={isMobile}
      />
      
      <div className={`transition-all duration-300 pt-16 
        ${isSidebarOpen ? 'ml-64' : isMobile ? 'ml-0' : 'ml-20'}`}>
        <main className="p-4 md:p-6"> 
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            {/* Main Content */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-xl shadow-md overflow-hidden"
            >
              <EntityManager
                entityType="Student"
                initialEntities={studentsData}
                apiEndpoint="http://localhost:8080/sub-admin"
                isAddModalOpen={isAddModalOpen}
                setIsAddModalOpen={setIsAddModalOpen}
                isImportModalOpen={isImportModalOpen}
                setIsImportModalOpen={setIsImportModalOpen}
              />
            </motion.div>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default ManageStudents;

