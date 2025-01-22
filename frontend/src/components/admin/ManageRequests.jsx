import React, { useState, useEffect } from 'react';
import { Mail, CheckCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

const ManageRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await fetch('http://localhost:8080/admin/manage-requests', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.status === 401) {
          console.info('Unauthorized access. Redirecting to login page.');
          navigate('/admin/login');
          return;
        }

        if (response.status === 500) {
          console.warn('Server error occurred while fetching requests.');
          return;
        }

        if (!response.ok) {
          console.error(`Unexpected error: ${response.statusText}`);
          return;
        }

        const data = await response.json();
        setRequests(data);
        console.info('Requests fetched successfully.');
      } catch (error) {
        console.error('Error occurred while fetching requests:', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [navigate]);

  const handleApprove = async (id) => {
    const requestToApprove = requests.find(request => request._id === id);
    if (!requestToApprove) return;

    const approvedData = {
      instituteName: requestToApprove.instituteName,
      numberOfStudents: requestToApprove.numberOfStudents.toString(),
      region: requestToApprove.region,
      instituteAdminName: requestToApprove.name,
      instituteAdminEmail: requestToApprove.email,
      institutePhoneNumber: requestToApprove.institutePhoneNumber,
      domainName: requestToApprove.domainName,
      status: 'active',
      requestId : requestToApprove.requestId
    };

    try {
      const response = await fetch('http://localhost:8080/admin/approve-institute', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(approvedData)
      });

      if (response.ok) {
        const updatedRequests = requests.filter(request => request._id !== id);
        setRequests(updatedRequests);
        alert(`Request approved for institute ID: ${id}`);
      } else {
        console.error('Failed to approve request:', response.statusText);
      }
    } catch (error) {
      console.error('Error occurred while approving request:', error.message);
    }
  };

  const handleReject = async (id) => {
    const requestToReject = requests.find(request => request._id === id);
    if (!requestToReject) return;

    const rejectedData = {
      requestId: requestToReject.requestId,
      status: 'rejected'
    };

    try {
      const response = await fetch('http://localhost:8080/admin/reject-institute', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(rejectedData)
      });

      if (response.ok) {
        const updatedRequests = requests.filter(request => request._id !== id);
        setRequests(updatedRequests);
        alert(`Request rejected for institute ID: ${id}`);
      } else {
        console.error('Failed to reject request:', response.statusText);
      }
    } catch (error) {
      console.error('Error occurred while rejecting request:', error.message);
    }
  };

  const handleMail = (email) => {
    const fromEmail = 'your-email@example.com'; // Replace with the actual sender email
    window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=&body=&from=${fromEmail}`, '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-16 w-16"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <header className=" p-4 rounded-lg shadow-md mb-6" style={{ backgroundColor: '#1b68b3' }}>
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold text-white">Manage Requests</h1>
          <div className="flex items-center space-x-2">
            <span className="text-white">ADMIN</span>
            <div className="w-8 h-8 bg-gray-400 rounded-full"></div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {requests.map((request) => (
          <div key={request._id} className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition-shadow">
<div className="mb-3">
  <h2 className="text-lg font-semibold " style={{ color: '#1b68b3' }}>{request.instituteName}</h2>
  <p className="text-gray-600 text-sm">{request.name} | {request.region}</p>
  <p className="text-gray-500 text-xs">
    {request.createdAt
      ? `${formatDistanceToNow(new Date(request.createdAt))} ago`
      : 'Timestamp not available'}
  </p>
</div>

            <div className="space-y-1 text-gray-700">
              <p><strong>Admin Email:</strong> {request.email}</p>
              <p><strong>Institute Phone:</strong> {request.institutePhoneNumber}</p>
              <p><strong>Domain:</strong> {request.domainName}</p>
              <p><strong>Students:</strong> {request.numberOfStudents}</p>
            </div>
            <div className="mt-4 flex justify-between items-center">
              <button
                onClick={() => handleApprove(request._id)}
                className="flex items-center bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
              >
                <CheckCircle className="w-5 h-5 mr-1" />
                Approve
              </button>
              <button
                onClick={() => handleReject(request._id)}
                className="flex items-center bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
              >
                <XCircle className="w-5 h-5 mr-1" />
                Reject
              </button>
              <button
                onClick={() => handleMail(request.email)}
                className="flex items-center bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
              >
                <Mail className="w-5 h-5 mr-1" />
                Email
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManageRequests;
