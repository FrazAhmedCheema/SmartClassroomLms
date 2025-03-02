import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, ListChecks, Users, MessageCircle } from 'lucide-react';

const ClassTabs = ({ activeTab, setActiveTab, userRole }) => {
  const tabs = [
    { id: 'stream', label: 'Stream', icon: <BookOpen size={18} /> },
    { id: 'classwork', label: 'Classwork', icon: <ListChecks size={18} /> },
    { id: 'people', label: 'People', icon: <Users size={18} /> },
    { id: 'discussion', label: 'Discussion', icon: <MessageCircle size={18} /> },
  ];

  return (
    <div className="rounded-lg overflow-hidden" 
         style={{ 
           backgroundColor: 'white', 
           boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)',
           border: '1px solid rgba(0,0,0,0.05)'
         }}>
      <div className="flex flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-4 text-sm font-medium flex items-center space-x-2 transition-all duration-200 flex-1 sm:flex-auto relative
              focus:outline-none focus:ring-0 focus:ring-offset-0 focus:border-0
              ${activeTab === tab.id ? 'font-semibold' : ''}`}
            style={{ 
              color: activeTab === tab.id ? '#1b68b3' : '#6b7280',
              backgroundColor: activeTab === tab.id ? 'rgba(27, 104, 179, 0.05)' : 'transparent'
            }}
          >
            <span style={{ color: activeTab === tab.id ? '#1b68b3' : '#9ca3af' }}>
              {tab.icon}
            </span>
            <span>{tab.label}</span>
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5"
                style={{ backgroundColor: '#1b68b3' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ClassTabs;
