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
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import store from '../../redux/store';

const ClassPage = ({ defaultTab = 'stream' }) => {
  const { id, assignmentId, topicId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(defaultTab);
  const dispatch = useDispatch();
  const { data: basicData, loading, error } = useSelector(state => state.class.basicInfo);

  const { isAuthenticated: isTeacher } = useSelector(state => state.teacher);
  const { isAuthenticated: isStudent } = useSelector(state => state.student);
  const userRole = isTeacher ? 'Teacher' : isStudent ? 'Student' : null;

  // Load basic data once and handle class switching
  useEffect(() => {
    if (id) {
      console.log("Fetching basic class info for class ID:", id);
      // This will now properly set current class ID first
      dispatch(fetchBasicInfo(id));

      // Rest of the data fetching
      const state = store.getState().class;
      if (!state.people.data) {
        dispatch(fetchPeople(id));
      }
      if (!state.classwork.data) {
        dispatch(fetchClasswork(id));
      }
      if (!state.discussions.data) {
        dispatch(fetchDiscussions(id));
      }
    }
  }, [id, dispatch]);

  // Log Redux state for debugging
  useEffect(() => {
    console.log("Redux state for basicInfo:", basicData);
    console.log("Loading state:", loading);
    console.log("Error state:", error);
  }, [basicData, loading, error]);

  const handleTabChange = (newTab) => {
    const tabRoutes = {
      stream: `/class/${id}`,
      classwork: `/cw/${id}`,
      people: `/people/${id}`,
      discussion: `/discussions/${id}`
    };
    
    navigate(tabRoutes[newTab]);
    setActiveTab(newTab);
  };

  const handleClearCache = () => {
    console.log('Clearing cache and resetting state...');
    dispatch({ type: 'class/resetClassState' }); // Reset the class slice state
    clearPersistedState(); // Clear persisted state
    window.location.reload(); // Reload the page to ensure a fresh state
  };

  return (
    <motion.div className="min-h-screen" style={{ backgroundColor: '#f9fafb' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Debugging button to clear cache */}
        <button
          onClick={handleClearCache}
          className="bg-red-500 text-white px-4 py-2 rounded mb-4"
        >
          Clear Cache
        </button>

        {/* Show loading spinner if data is still loading */}
        {loading && (
          <div className="flex justify-center py-8">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {/* Show error message if there's an error */}
        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg text-center">
            <AlertCircle className="inline-block mr-2" />
            <span>Failed to load class data. Please try again later.</span>
          </div>
        )}

        {/* Render content only if data is loaded and no error */}
        {!loading && !error && basicData ? (
          <div>
            <ClassTabs activeTab={activeTab} setActiveTab={handleTabChange} userRole={userRole} />
            <div className="mt-6">
              {activeTab === 'stream' && (
                <StreamTab
                  classData={basicData}
                  userRole={userRole}
                  onError={(e) => console.error('Error in StreamTab:', e)}
                />
              )}
              {activeTab === 'classwork' && (
                <ClassworkTab
                  classId={id}
                  userRole={userRole}
                  assignmentId={assignmentId}
                  onError={(e) => console.error('Error in ClassworkTab:', e)}
                />
              )}
              {activeTab === 'people' && (
                <PeopleTab
                  classId={id}
                  userRole={userRole}
                  onError={(e) => console.error('Error in PeopleTab:', e)}
                />
              )}
              {activeTab === 'discussion' && (
                <DiscussionTab
                  classId={id}
                  topicId={topicId}
                  onError={(e) => console.error('Error in DiscussionTab:', e)}
                />
              )}
            </div>
          </div>
        ) : (
          !loading && !error && (
            <div className="text-center text-gray-500">
              <p>No class data available. Please try again later.</p>
            </div>
          )
        )}
      </div>
    </motion.div>
  );
};

export default ClassPage;
