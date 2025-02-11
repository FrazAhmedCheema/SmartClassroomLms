import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import useMediaQuery from '../../hooks/useMediaQuery';
import EntityManager from "../../components/sub-admin/EntityManager";
import Navbar from "../../components/sub-admin/Navbar";
import Sidebar from "../../components/sub-admin/Sidebar";

const ManageTeachers = () => {
  const isMobile = useMediaQuery('(max-width: 1024px)');
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile);
  const navigate = useNavigate();
  const [teachersData, setTeachersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Add sidebar responsive behavior
  useEffect(() => {
    setIsSidebarOpen(!isMobile);
  }, [isMobile]);

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const response = await fetch("http://localhost:8080/sub-admin/teachers",{
          credentials : 'include',
          headers :{
            "Content-Type": "application/json",
            
          }
        })
        if (!response.ok) {
          throw new Error("Failed to fetch teachers")
        }
        const data = await response.json()
        // Transform the data to match the desired structure
        const transformedData = data.data.map((teacher) => ({
          ...teacher,
          id: teacher.teacherId,
        }))
        setTeachersData(transformedData)
      } catch (error) {
        navigate('/sub-admin/login');

        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchTeachers()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#1b68b3] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading teachers data...</p>
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
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
        isMobile={isMobile}
      />
      <Sidebar 
        isOpen={isSidebarOpen} 
        toggle={() => setIsSidebarOpen(!isSidebarOpen)}
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
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-xl shadow-md overflow-hidden"
            >
              <EntityManager
                entityType="Teacher"
                initialEntities={teachersData}
                apiEndpoint="http://localhost:8080/sub-admin"
              />
            </motion.div>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default ManageTeachers;

