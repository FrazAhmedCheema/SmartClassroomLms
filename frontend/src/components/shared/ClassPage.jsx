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

  // Load basic data once
  useEffect(() => {
    if (id && !basicData) {
      dispatch(fetchBasicInfo(id));
    }
  }, [id, dispatch, basicData]);

  // Pre-fetch other tab data when component mounts
  useEffect(() => {
    if (id) {
      // Fetch all data in parallel but only if not already in store
      const state = store.getState().class;
      if (!state.people.data) dispatch(fetchPeople(id));
      if (!state.classwork.data) dispatch(fetchClasswork(id));
      if (!state.discussions.data) dispatch(fetchDiscussions(id));
    }
  }, [id, dispatch]);

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

  return (
    <motion.div className="min-h-screen" style={{ backgroundColor: '#f9fafb' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <ClassTabs activeTab={activeTab} setActiveTab={handleTabChange} userRole={userRole} />
        
        <div className="mt-6">
          {activeTab === 'stream' && (
            <StreamTab classData={basicData} userRole={userRole} />
          )}
          
          {activeTab === 'classwork' && (
            <ClassworkTab 
              classId={id} 
              userRole={userRole} 
              assignmentId={assignmentId} 
            />
          )}
          
          {activeTab === 'people' && (
            <PeopleTab classId={id} userRole={userRole} />
          )}
          
          {activeTab === 'discussion' && (
            <DiscussionTab 
              classId={id} 
              topicId={topicId}
            />
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ClassPage;
