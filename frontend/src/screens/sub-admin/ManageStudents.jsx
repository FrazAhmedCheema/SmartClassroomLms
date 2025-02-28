import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import EntityManager from "../../components/sub-admin/EntityManager";

const ManageStudents = () => {
  const [studentsData, setStudentsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch("http://localhost:8080/sub-admin/students", {
          credentials: 'include',
          headers: {
            "Content-Type": "application/json",
          }
        });
        if (!response.ok) {
          throw new Error("Failed to fetch students");
        }
        const data = await response.json();
        const transformedData = data.data.map((student) => ({
          ...student,
          id: student.studentId,
        }));
        setStudentsData(transformedData);
      } catch (error) {
        navigate('/sub-admin/login');
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="flex flex-col items-center gap-4 bg-white p-8 rounded-2xl shadow-lg">
          <div className="w-16 h-16 border-4 border-t-4 border-t-blue-600 border-blue-100 rounded-full animate-spin"></div>
          <p className="text-blue-600 font-semibold text-lg">Loading students data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="flex flex-col items-center gap-4 bg-white p-8 rounded-2xl shadow-lg text-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-2">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-xl font-semibold text-gray-800 mb-2">Error: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
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
            entityType="Student"
            initialEntities={studentsData}
            apiEndpoint="http://localhost:8080/sub-admin"
          />
        </motion.div>
      </motion.div>
    </main>
  );
};

export default ManageStudents;

