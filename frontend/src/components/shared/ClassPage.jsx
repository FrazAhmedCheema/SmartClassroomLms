import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBasicInfo, fetchPeople, fetchClasswork, fetchDiscussions } from '../../redux/actions/classActions';
import ClassTabs from './ClassTabs';
import StreamTab from './StreamTab';
import ClassworkTab from './ClassworkTab';
import PeopleTab from './PeopleTab';
import DiscussionTab from './DiscussionTab';
import { AlertCircle } from 'lucide-react';
import store from '../../redux/store';

const ClassPage = ({ defaultTab = 'stream' }) => {
  const { id, assignmentId, topicId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(defaultTab);
  const dispatch = useDispatch();
  const { data: basicData, loading, error } = useSelector(state => state.class.basicInfo);

  const { isAuthenticated: isTeacher, token: teacherToken } = useSelector(state => state.teacher);
  const { isAuthenticated: isStudent } = useSelector(state => state.student);
  const userRole = isTeacher ? 'Teacher' : isStudent ? 'Student' : null;

  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    const fetchClassData = async () => {
      if (!id || !userRole) return;

      try {
        setFetchError(null);
        console.log("Fetching data as:", userRole);

        // Fetch basic info
        await dispatch(fetchBasicInfo(id));

        // Fetch other data in parallel
        await Promise.all([
          dispatch(fetchPeople(id)),
          dispatch(fetchClasswork(id)),
          dispatch(fetchDiscussions(id))
        ]);
      } catch (error) {
        console.error("Error fetching class data:", error);
        setFetchError(error.message || 'Failed to fetch class data');
      }
    };

    fetchClassData();
  }, [id, userRole, dispatch]);

  if (!userRole) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Authentication Error</h2>
          <p className="text-gray-600">Please login again to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div className="min-h-screen" style={{ backgroundColor: '#f9fafb' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600">Loading class data...</p>
          </div>
        )}

        {/* Error State */}
        {(error || fetchError) && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg text-center">
            <AlertCircle className="inline-block mr-2" />
            <span>{error || fetchError}</span>
          </div>
        )}

        {/* Render content only if data is loaded and no error */}
        {!loading && !error && basicData && (
          <div>
            <ClassTabs activeTab={activeTab} setActiveTab={setActiveTab} userRole={userRole} />
            <div className="mt-6">
              {activeTab === 'stream' && <StreamTab classData={basicData} userRole={userRole} />}
              {activeTab === 'classwork' && <ClassworkTab classId={id} userRole={userRole} assignmentId={assignmentId} />}
              {activeTab === 'people' && <PeopleTab classId={id} userRole={userRole} />}
              {activeTab === 'discussion' && <DiscussionTab classId={id} topicId={topicId} />}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ClassPage;
