import React, { createContext, useContext, useState } from 'react';

const ClassesContext = createContext();

export const ClassesProvider = ({ children }) => {
  const [classesData] = useState([
    {
      id: 1,
      name: 'Computer Science - CS101',
      description: 'Introduction to Computer Science and Programming',
      teacher: {
        name: 'Dr. John Doe',
        email: 'john.doe@example.com',
        expertise: 'Programming',
        qualification: 'Ph.D. in Computer Science',
        experience: '10 years'
      },
      totalStudents: 30,
      schedule: 'Mon, Wed 10:00 AM - 11:30 AM',
      room: 'Room 101',
      startDate: '2024-01-15',
      endDate: '2024-05-15',
      students: [
        { id: 1, name: 'Alice Johnson', rollNo: 'CS101-1', status: 'active', email: 'alice@example.com' },
        { id: 2, name: 'Bob Smith', rollNo: 'CS101-2', status: 'active', email: 'bob@example.com' },
      ]
    },
    {
      id: 2,
      name: 'Database Management - DB201',
      description: 'Advanced Database Management Systems',
      teacher: {
        name: 'Prof. Sarah Wilson',
        email: 'sarah.wilson@example.com',
        expertise: 'Database Systems',
        qualification: 'Ph.D. in Database Management',
        experience: '8 years'
      },
      totalStudents: 25,
      schedule: 'Tue, Thu 2:00 PM - 3:30 PM',
      room: 'Room 102',
      startDate: '2024-01-20',
      endDate: '2024-05-20',
      students: [
        { id: 3, name: 'Charlie Brown', rollNo: 'DB201-1', status: 'active', email: 'charlie@example.com' },
        { id: 4, name: 'Diana Clark', rollNo: 'DB201-2', status: 'inactive', email: 'diana@example.com' },
      ]
    }
  ]);

  const getClassById = (id) => {
    return classesData.find(cls => cls.id === Number(id));
  };

  return (
    <ClassesContext.Provider value={{ classesData, getClassById }}>
      {children}
    </ClassesContext.Provider>
  );
};

export const useClasses = () => useContext(ClassesContext);
