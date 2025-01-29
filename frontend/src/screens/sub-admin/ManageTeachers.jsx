import React from 'react';
import ManageEntities from '../../components/sub-admin/ManageEntities';

const ManageTeachers = () => {
  const teachersData = [
    {
      id: 1,
      name: 'John Doe',
      rollNo: 'T-01',
      email: 'john.doe@gmail.com',
      password: '123456',
      status: 'active'
    },
    {
      id: 2,
      name: 'Jane Smith',
      rollNo: 'T-02',
      email: 'jane.smith@gmail.com',
      password: '123456',
      status: 'active'
    },
    {
      id: 3,
      name: 'Mike Johnson',
      rollNo: 'T-03',
      email: 'mike.johnson@gmail.com',
      password: '123456',
      status: 'inactive'
    },
    {
      id: 4,
      name: 'Emily Davis',
      rollNo: 'T-04',
      email: 'emily.davis@gmail.com',
      password: '123456',
      status: 'inactive'
    },
  ];

  return <ManageEntities entityType="Teacher" entitiesData={teachersData} />;
};

export default ManageTeachers;
