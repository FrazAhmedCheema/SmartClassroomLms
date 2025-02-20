import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, ChevronDown, ChevronUp } from 'lucide-react';

const DocumentationModal = ({ isOpen, onClose }) => {
  const [expandedDocs, setExpandedDocs] = useState([]);

  const docs = [
    {
      title: "Getting Started",
      content: "Complete guide to getting started with SmartClassroom platform.",
      fullContent: "Welcome to SmartClassroom! This guide will help you get started with the platform, including creating your account, setting up your profile, and navigating through the basic features. Whether you are a student, teacher, or subadmin, SmartClassroom is designed to be user-friendly and intuitive, making it easy for new users to get started quickly."
    },
    {
      title: "For Students",
      content: "Learn how to access classes, submit assignments, and engage in discussions.",
      fullContent: <>As a <span className="font-bold">Student</span>, you can log in to your SmartClassroom account and access your enrolled courses. You will find course materials, assignments, and discussion forums under each class. You can submit assignments, create/participate in discussions, and track your progress through the system. The platform ensures a seamless and interactive learning experience.</>
    },
    {
      title: "For Teachers",
      content: "Guide for teachers to manage courses, assessments, and discussions.",
      fullContent: <>As a <span className="font-bold">Teacher</span>, As a Teacher, once your account is created by the SubAdmin, you can log in to SmartClassroom and start managing your courses. You can upload lecture materials, organize content, and provide study resources for students. The system allows you to create and distribute assignments, evaluate submissions, and even compile and run students' code for programming-related tasks. <br></br> <br /> Discussions are an integral part of the platform, enabling you to initiate forums, guide conversations, and foster collaboration. Additionally, you can provide feedback on assessments and ensure academic integrity through the system’s plagiarism detection features. SmartClassroom is designed to streamline course management while offering you the flexibility to create an engaging and interactive learning environment.</>
    },
    {
      title: "For SubAdmins",
      content: "Manage your institution, register teachers and students, and oversee system activities.",
      fullContent: <>As a <span className="font-bold">SubAdmin</span>, you play a crucial role in managing the SmartClassroom system for your institution. To get started, you must first <span className="font-bold">send a registration request</span>. Once the request is approved, you can log in and begin setting up your institution's teachers, students, and classes. <br></br> <br /> After logging in, your dashboard will provide tools to add teachers, enroll students.  The system is designed to make administrative tasks efficient and hassle-free, so you can focus on optimizing the learning environment.</>
    },
    {
      title: "Technical Requirements",
      content: "System requirements and browser compatibility information.",
      fullContent: "SmartClassroom works best with modern web browsers like Chrome, Firefox, Safari, or Edge. Minimum requirements include a stable internet connection, webcam for live sessions, and updated browser version. Mobile devices should run iOS 12+ or Android 8+."
    }
  ];

  const toggleExpand = (index) => {
    setExpandedDocs(prev => {
      if (prev.includes(index)) {
        return prev.filter(i => i !== index);
      }
      return [...prev, index];
    });
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center overflow-y-auto p-4 sm:p-6"
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        className="bg-white rounded-xl w-full max-w-2xl mx-auto my-8"
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Documentation</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-6">
            {docs.map((doc, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
              >
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{doc.title}</h3>
                <p className="text-gray-600">
                  {expandedDocs.includes(index) ? doc.fullContent : doc.content}
                </p>
                <button 
                  onClick={() => toggleExpand(index)}
                  className="mt-2 text-sm text-[#1b68b3] hover:text-blue-700 inline-flex items-center gap-1 transition-colors"
                >
                  <span>{expandedDocs.includes(index) ? "Read less" : "Read more"}</span>
                  {expandedDocs.includes(index) ? 
                    <ChevronUp className="w-3 h-3" /> : 
                    <ChevronDown className="w-3 h-3" />
                  }
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default DocumentationModal;
