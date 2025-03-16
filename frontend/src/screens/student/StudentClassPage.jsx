import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ClassTabs from '../../components/shared/ClassTabs';
import StreamTab from '../../components/shared/StreamTab';
import ClassworkTab from '../../components/shared/ClassworkTab';
import PeopleTab from '../../components/shared/PeopleTab';
import DiscussionTab from '../../components/shared/DiscussionTab';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const StudentClassPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('stream');
  const [classData, setClassData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClassData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Try to fetch from API
        const response = await fetch(`http://localhost:8080/student/class/${id}`, {
          credentials: 'include'
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `Failed to fetch class data: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Student class data:', data);
        
        // Extract the class data from the response
        if (data.success && data.class) {
          // For student view, we remove the class code
          const studentClassData = data.class;
          // Hide class code from student view
          delete studentClassData.classCode;
          setClassData(studentClassData);
        } else {
          throw new Error('Invalid data structure received from the API');
        }
      } catch (err) {
        console.error('Error fetching class:', err);
        setError(err.message || 'Failed to load class data');
        
        // Redirect to dashboard if it's an authentication error
        if (err.message?.includes('401') || err.message?.includes('unauthorized')) {
          navigate('/student/login');
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchClassData();
  }, [id, navigate]);

  // Animation variants
  const pageTransition = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f9fafb' }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 rounded-full"
          style={{ border: '4px solid #e5e7eb', borderTopColor: '#1b68b3' }}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f9fafb' }}>
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <AlertCircle size={48} className="mx-auto mb-4 text-red-500" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link 
            to="/student/home"
            className="px-4 py-2 bg-[#1b68b3] text-white rounded-lg hover:bg-[#145091] transition-colors inline-flex items-center"
          >
            <ArrowLeft size={18} className="mr-2" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!classData) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f9fafb' }}>
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <AlertCircle size={48} className="mx-auto mb-4 text-amber-500" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Class Not Found</h2>
          <p className="text-gray-600 mb-6">The requested class could not be found or you don't have access to it.</p>
          <Link 
            to="/student/home"
            className="px-4 py-2 bg-[#1b68b3] text-white rounded-lg hover:bg-[#145091] transition-colors inline-flex items-center"
          >
            <ArrowLeft size={18} className="mr-2" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen"
      style={{ backgroundColor: '#f9fafb' }}
      initial="hidden"
      animate="visible"
      variants={pageTransition}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Back button */}

        
        {/* Tab navigation */}
        <ClassTabs activeTab={activeTab} setActiveTab={setActiveTab} userRole="Student" />
        
        {/* Tab content */}
        <div className="mt-6">
          {activeTab === 'stream' && (
            <StreamTab classData={classData} userRole="Student" />
          )}
          
          {activeTab === 'classwork' && (
            <ClassworkTab classData={classData} userRole="Student" />
          )}
          
          {activeTab === 'people' && (
            <PeopleTab classData={classData} userRole="Student" />
          )}
          
          {activeTab === 'discussion' && (
            <DiscussionTab 
              classId={classData._id} // Make sure to pass the correct classId
            />
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default StudentClassPage;
