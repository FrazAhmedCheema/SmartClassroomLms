import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion'; // Add this import
import { Mail, CheckCircle, XCircle, ArrowLeft, Search, ClipboardList } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';

import ComposeEmailModal from './ComposeEmailModal';
import AdminNavbar from './AdminNavbar';

const ManageRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredRequests, setFilteredRequests] = useState([]);
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

  useEffect(() => {
    // Filter requests whenever searchTerm changes
    const filtered = requests.filter(request =>
      request.instituteName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.instituteAdminName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredRequests(filtered);
  }, [searchTerm, requests]);

  const handleApprove = async (id) => {
    const requestToApprove = requests.find(request => request._id === id);
    if (!requestToApprove) return;

    Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to approve the request for ${requestToApprove.instituteName}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, approve!',
      cancelButtonText: 'Cancel',
      background: '#fff',
      borderRadius: '1rem',
      customClass: {
        title: 'text-xl font-bold text-gray-800',
        content: 'text-md text-gray-600',
        confirmButton: 'px-4 py-2 text-white rounded-lg text-sm font-medium',
        cancelButton: 'px-4 py-2 text-white rounded-lg text-sm font-medium'
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
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
          username: requestToApprove.username,
          password: requestToApprove.password,
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
            setFilteredRequests(updatedRequests); // Update filtered requests
            toast.success(`Request approved for institute: ${requestToApprove.instituteName}`, {
              position: 'top-right',
            });
          } else {
            console.error('Failed to approve request:', response.statusText);
          }
        } catch (error) {
          console.error('Error occurred while approving request:', error.message);
        }
      }
    });
  };

  const handleReject = async (id) => {
    const requestToReject = requests.find(request => request._id === id);
    if (!requestToReject) return;

    Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to reject the request for ${requestToReject.instituteName}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, reject!',
      cancelButtonText: 'Cancel',
      background: '#fff',
      borderRadius: '1rem',
      customClass: {
        title: 'text-xl font-bold text-gray-800',
        content: 'text-md text-gray-600',
        confirmButton: 'px-4 py-2 text-white rounded-lg text-sm font-medium',
        cancelButton: 'px-4 py-2 text-white rounded-lg text-sm font-medium'
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        const rejectedData = {
          requestId: requestToReject.requestId,
          status: 'rejected'
        };
        const updatedRequests = requests.filter(request => request._id !== id);
        setRequests(updatedRequests);
        setFilteredRequests(updatedRequests); 

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
// Update filtered requests
            toast.error(`Request rejected for institute: ${requestToReject.instituteName}`, {
              position: toast.POSITION.TOP_RIGHT
            });
          } else {
            console.error('Failed to reject request:', response.statusText);
          }
        } catch (error) {
          console.error('Error occurred while rejecting request:', error.message);
        }
      }
    });
  };

  const handleOpenMailModal = (institute) => {
    console.log('Opening mail modal for:', institute);
    setSelectedInstitute(institute);
    setIsModalOpen(true);
  };

  const handleSendEmail = async ({ subject, body }) => {
    if (!selectedInstitute) return;
    try {
      const response = await fetch(`http://localhost:8080/admin/send-email/${selectedInstitute._id}`, {
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

  const handleBack = () => {
    navigate('/admin/dashboard');
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#e6f0ff" }}>
      <AdminNavbar title="Manage Requests" />
      <main className="p-4 md:p-6 pt-8">
        {/* Back to Dashboard Button */}
        <div className="mb-4">
          <button
            onClick={handleBack}
            className="flex items-center text-gray-700 hover:text-blue-600 px-3 py-2 rounded-lg transition-colors bg-white shadow-sm hover:bg-gray-50"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-xl shadow-md overflow-hidden"
          >
            {/* Header Section */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                <div className="flex items-center space-x-3">
                  <ClipboardList className="w-8 h-8 text-[#1b68b3]" />
                  <div className="flex flex-col space-y-2">
                    <h1 className="text-2xl font-bold text-[#1b68b3] flex items-center">
                      <ClipboardList className="w-7 h-7 mr-2" />
                      Institute Requests
                    </h1>
                    <p className="text-gray-600">Manage institute registration requests</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search requests..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-4 py-2 pl-10 rounded-lg border-2 border-[#1b68b3] 
                               focus:border-[#154d85] focus:outline-none transition-all
                               bg-white text-gray-600 placeholder-gray-400"
                    />
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
                  </div>
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="p-6">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1b68b3]"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredRequests.map((request) => (
                    <div key={request._id} className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
                      <div className="mb-4">
                        <h2 className="text-xl font-bold  mb-2"style={{ color: "#1b68b3" }}>{request.instituteName}</h2>
                        <div className="flex items-center text-gray-600 text-sm space-x-2">
                          <span>{request.instituteAdminName}</span>
                          <span>•</span>
                          <span>{request.region}</span>
                        </div>
                        <p className="text-gray-500 text-xs mt-1">
                          {request.createdAt
                            ? `${formatDistanceToNow(new Date(request.createdAt))} ago`
                            : 'Timestamp not available'}
                        </p>
                      </div>

                      <div className="space-y-2 text-gray-700 mb-6">
                        <p className="flex items-center justify-between">
                          <span className="font-medium">Admin Email:</span>
                          <span className="text-gray-600">{request.instituteAdminEmail}</span>
                        </p>
                        <p className="flex items-center justify-between">
                          <span className="font-medium">Phone:</span>
                          <span className="text-gray-600">{request.institutePhoneNumber}</span>
                        </p>
                        <p className="flex items-center justify-between">
                          <span className="font-medium">Domain:</span>
                          <span className="text-gray-600">{request.domainName}</span>
                        </p>
                        <p className="flex items-center justify-between">
                          <span className="font-medium">Students:</span>
                          <span className="text-gray-600">{request.numberOfStudents}</span>
                        </p>
                      </div>

                      <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                        <button
                          onClick={() => handleApprove(request._id)}
                          className="flex items-center bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition-colors"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleOpenMailModal(request)}
                          className="flex items-center bg-[#1b68b3] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#154d85] transition-colors"
                        >
                          <Mail className="w-4 h-4 mr-2" />
                          Email
                        </button>
                        <button
                          onClick={() => handleReject(request._id)}
                          className="flex items-center bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 transition-colors"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      </main>
      <ComposeEmailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSend={handleSendEmail}
        recipientName={selectedInstitute?.instituteName || ''}
        recipientEmail={selectedInstitute?.instituteAdminEmail || ''}
      />
    </div>
  );
};

export default ManageRequests;
