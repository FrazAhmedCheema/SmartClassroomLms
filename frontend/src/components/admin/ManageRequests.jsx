import React, { useState, useEffect } from 'react';
import { Mail, CheckCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import ComposeEmailModal from './ComposeEmailModal';


const ManageRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInstitute, setSelectedInstitute] = useState(null);

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
      instituteAdminName: requestToApprove.instituteAdminName,
      instituteAdminEmail: requestToApprove.instituteAdminEmail,
      institutePhoneNumber: requestToApprove.institutePhoneNumber,
      domainName: requestToApprove.domainName,
      status: 'active',
      requestId: requestToApprove.requestId,
      username: requestToApprove.username, // Include username
      password: requestToApprove.password, // Include password
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
        toast.success(`Request approved for institute: ${requestToApprove.instituteName}`, {
          position: 'top-right', // Use string-based position for reliability
        });
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
        toast.error(`Request rejected for institute: ${requestToReject.instituteName}`, {
          position: toast.POSITION.TOP_RIGHT
        });
      } else {
        console.error('Failed to reject request:', response.statusText);
      }
    } catch (error) {
      console.error('Error occurred while rejecting request:', error.message);
    }
  };

  const handleOpenMailModal = (institute) => {
    console.log('Opening mail modal for:', institute);
    setSelectedInstitute(institute);
    setIsModalOpen(true);
  };



  const handleSendEmail = async ({ subject, body }) => {
    if (!selectedInstitute) return;
    try {
      const response = await fetch(`http://localhost:8080/admin/manage-institutes/${selectedInstitute._id}/email`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, body, mailType: 'request' }),
      });

      if (!response.ok) throw new Error('Failed to send email');

      alert(`Email sent successfully to ${selectedInstitute.instituteName}`);
    } catch (error) {
      console.error('Error sending email:', error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-16 w-16"></div>
      </div>
    );
  }

  return (
    <>
    <div className="min-h-screen bg-gray-100 p-6">
      <ToastContainer />
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
  <p className="text-gray-600 text-sm">{request.instituteAdminName} | {request.region}</p>
  <p className="text-gray-500 text-xs">
    {request.createdAt
      ? `${formatDistanceToNow(new Date(request.createdAt))} ago`
      : 'Timestamp not available'}
  </p>
</div>

            <div className="space-y-1 text-gray-700">
              <p><strong>Admin Email:</strong> {request.instituteAdminEmail}</p>
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
                onClick={() => handleOpenMailModal(request)}
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
    <ComposeEmailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSend={handleSendEmail}
        recipientEmail={selectedInstitute?.instituteName || ''}
      />
    </>
  );
};

export default ManageRequests;
