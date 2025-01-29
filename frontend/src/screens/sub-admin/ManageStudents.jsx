import React from 'react';
import ManageEntities from '../../components/sub-admin/ManageEntities';

const ManageStudents = () => {
  const studentsData = [
    {
      id: 1,
      name: 'Ayesha Asghar',
      rollNo: '2021-CS-01',
      email: 'ayesha@gmail.com',
      password: '123456',
      status: 'active'
    },
    {
      id: 2,
      name: 'Fraz Ahmed',
      rollNo: '2021-CS-02',
      email: 'fraz@gmail.com',
      password: '123456',
      status: 'active'
    },
    {
      id: 3,
      name: 'Zain',
      rollNo: '2021-CS-03',
      email: 'zain@gmail.com',
      password: '123456',
      status: 'inactive'
    },
    {
      id: 4,
      name: 'Nimra Aslam',
      rollNo: '2021-CS-04',
      email: 'nimra@gmail.com',
      password: '123456',
      status: 'inactive'
    },
    {
      id: 5,
      name: 'Ali Khan',
      rollNo: '2021-CS-05',
      email: 'ali@gmail.com',
      password: '123456',
      status: 'active'
    },
    {
      id: 6,
      name: 'Sara Ali',
      rollNo: '2021-CS-06',
      email: 'sara@gmail.com',
      password: '123456',
      status: 'inactive'
    },
    {
      id: 7,
      name: 'Usman Tariq',
      rollNo: '2021-CS-07',
      email: 'usman@gmail.com',
      password: '123456',
      status: 'active'
    },
    {
      id: 8,
      name: 'Hina Malik',
      rollNo: '2021-CS-08',
      email: 'hina@gmail.com',
      password: '123456',
      status: 'inactive'
    },
    {
      id: 9,
      name: 'Bilal Ahmed',
      rollNo: '2021-CS-09',
      email: 'bilal@gmail.com',
      password: '123456',
      status: 'active'
    },
    {
      id: 10,
      name: 'Ayesha Khan',
      rollNo: '2021-CS-10',
      email: 'ayesha.khan@gmail.com',
      password: '123456',
      status: 'inactive'
    },
  ];

  return <ManageEntities entityType="Student" entitiesData={studentsData} />;
};

export default ManageStudents;
