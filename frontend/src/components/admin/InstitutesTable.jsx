import React, { useState } from 'react';
import ComposeEmailModal from './ComposeEmailModal';
import Swal from 'sweetalert2';

const InstitutesTable = ({ institutes, setInstitutes, setFilteredInstitutes }) => {
  const [editableInstituteId, setEditableInstituteId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    status: ''
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInstitute, setSelectedInstitute] = useState(null);

  const handleEditClick = (institute) => {
    Swal.fire({
      title: 'Update Institute Status',
      text: `Do you want to edit the status of ${institute.instituteName}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, edit!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        setEditableInstituteId(institute._id);
        setEditFormData({
          status: institute.status
        });
      }
    });
  };
  const handleSaveClick = async (id) => {
    const instituteToUpdate = institutes.find(inst => inst._id === id);
  
    Swal.fire({
      title: 'Save Changes?',
      text: `Do you want to save changes for ${instituteToUpdate.instituteName}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, save!',
      cancelButtonText: 'Cancel'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(`http://localhost:8080/admin/update-institute-status/${id}`, {
            method: 'PUT',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(editFormData),
          });
  
          if (!response.ok) throw new Error('Failed to update institute');
  
          const data = await response.json();
          console.log("API Response:", data);
          if (data) {
            const updatedInstitutes = institutes.map((institute) =>
              institute._id === id ? { ...institute, status: editFormData.status } : institute
            );
  
            setInstitutes([...updatedInstitutes]); // Ensure state update triggers re-render
            setFilteredInstitutes([...updatedInstitutes]);
            setEditableInstituteId(null);
            setEditFormData({ status: '' });
  
            Swal.fire({
              title: 'Updated!',
              text: 'Institute status has been updated successfully.',
              icon: 'success',
              timer: 1500
            });
          }
        } catch (error) {
          console.error('Error updating institute:', error);
          Swal.fire({
            title: 'Error!',
            text: error.message || 'Failed to update institute status.',
            icon: 'error'
          });
        }
      }
    });
  };


  const handleDelete = async (id) => {
    const instituteToDelete = institutes.find(institute => institute._id === id);

    Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to delete ${instituteToDelete.instituteName}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete!',
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
        try {
          const response = await fetch(`http://localhost:8080/admin/delete-institute/${id}`, {
            method: 'DELETE',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' }
          });

          if (response.ok) {
            const updatedInstitutes = institutes.filter(institute => institute._id !== id);
            setInstitutes(updatedInstitutes);
            setFilteredInstitutes(updatedInstitutes);

            Swal.fire({
              title: 'Deleted!',
              text: 'Institute has been deleted successfully.',
              icon: 'success',
              timer: 1500
            });
          }
        } catch (error) {
          console.error('Error deleting institute:', error);
          Swal.fire({
            title: 'Error!',
            text: 'Failed to delete institute.',
            icon: 'error'
          });
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
        body: JSON.stringify({ subject, body }),
      });

      if (!response.ok) throw new Error('Failed to send email');

      Swal.fire({
        title: 'Success!',
        text: `Email sent successfully to ${selectedInstitute.instituteName}`,
        icon: 'success',
        timer: 1500
      });
    } catch (error) {
      console.error('Error sending email:', error.message);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to send email.',
        icon: 'error'
      });
    }
  };

  const handleCancel = () => {
    setEditableInstituteId(null);
    setEditFormData({
      status: ''
    });
  };

  return (
    <>
      <table className="w-full">
        <thead>
          <tr className="text-white" style={{ backgroundColor: '#1b68b3' }}>
            <th className="px-6 py-3 text-left font-semibold">InstituteID</th>
            <th className="px-6 py-3 text-left font-semibold">Name</th>
            <th className="px-6 py-3 text-left font-semibold">Admin</th>
            <th className="px-6 py-3 text-left font-semibold">Status</th>
            <th className="px-6 py-3 text-left font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {institutes.map((institute) => (
            <tr key={institute._id} className="border-t text-gray-700">
              <td className="px-6 py-4">
                {institute.instituteId}
              </td>
              <td className="px-6 py-4">
                {institute.instituteName}
              </td>
              <td className="px-6 py-4">
                {institute.instituteAdminName}
              </td>
              <td className="px-6 py-4">
                {editableInstituteId === institute._id ? (
                  <select
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                    className="w-full px-2 py-1 border rounded bg-white text-black"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                ) : (
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    institute.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {institute.status}
                  </span>
                )}
              </td>
              <td className="px-6 py-4">
                <div className="flex space-x-2">
                  {editableInstituteId === institute._id ? (
                    <>
                      <button
                        onClick={() => handleSaveClick(institute._id)}
                        className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancel}
                        className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleEditClick(institute)}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                    >
                      Update
                    </button>
                  )}
                  <button
                    onClick={() => handleOpenMailModal(institute)}
                    className="bg-yellow-600 text-white px-3 py-1 rounded text-sm"
                  >
                    Mail
                  </button>
                  <button
                    onClick={() => handleDelete(institute._id)}
                    className="bg-red-600 text-white px-3 py-1 rounded text-sm"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ComposeEmailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSend={handleSendEmail}
        recipientName={selectedInstitute?.instituteName || ''}
        recipientEmail={selectedInstitute?.instituteAdminEmail || ''}
      />
    </>
  );
};

export default InstitutesTable;














// import React, { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';
// import InstituteForm1 from '../../components/sub-admin/InstituteForm1';
// import InstituteForm2 from '../../components/sub-admin/InstituteForm2';
// import InstituteForm3 from '../../components/sub-admin/InstituteForm3';
// import InstituteForm4 from '../../components/sub-admin/InstituteForm4';
// import InstituteForm5 from '../../components/sub-admin/InstituteForm5';
// import InstituteForm6 from '../../components/sub-admin/InstituteForm6';
// import logo from '../../assets/logo.png';


// const RegisterInstitute = () => {
//   const [step, setStep] = useState(1);
//   const [formData, setFormData] = useState({
//     instituteName: '',
//     numberOfStudents: '',
//     region: '',
//     instituteAdminName: '',
//     instituteAdminEmail: '',
//     institutePhoneNumber: '',
//     domainName: '',
//     username: '',
//     password: '',
//   });

//   const handleNext = () => {
//     if (step === 6) {
//       submitRegistrationForm(); // Submit on the last step
//     } else {
//       setStep((prev) => prev + 1);
//     }
//   };

//   const handlePrevious = () => {
//     setStep((prev) => prev - 1);
//   };

//   const submitRegistrationForm = async () => {
//     try {
//       const response = await fetch('http://localhost:8080/sub-admin/registerInstitute', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(formData),
//       });

//       if (response.status === 201) {
//         const data = await response.json();
//         console.log('Registration request processed:', data);
//       } else {
//         const errorData = await response.json();
//         console.error('Registration failed:', errorData);
//       }
//     } catch (error) {
//       console.error('An error occurred during registration:', error);
//     }

//     // Move to the final "thank you" step
//     setStep(7);
//   };

//   return (
//     <div className="flex flex-col items-center justify-center min-h-screen bg-white">
//       <div className="fixed top-0 w-full flex flex-col items-center">
//         <img src={logo} alt="Logo" className="h-16 mt-4" />
//         <hr className="w-full border-gray-300 mt-4" />
//       </div>
//       <div className="w-full max-w-md p-8 bg-blue-50 rounded-lg shadow-md mt-20">
//         {step === 1 && <InstituteForm1 onNext={handleNext} formData={formData} setFormData={setFormData} />}
//         {step === 2 && <InstituteForm2 onNext={handleNext} onPrevious={handlePrevious} formData={formData} setFormData={setFormData} />}
//         {step === 3 && <InstituteForm3 onNext={handleNext} onPrevious={handlePrevious} formData={formData} setFormData={setFormData} />}
//         {step === 4 && <InstituteForm4 onNext={handleNext} onPrevious={handlePrevious} formData={formData} setFormData={setFormData} />}
//         {step === 5 && <InstituteForm5 onNext={handleNext} onPrevious={handlePrevious} formData={formData} />}
//         {step === 6 && <InstituteForm6 onNext={handleNext} onPrevious={handlePrevious} formData={formData} setFormData={setFormData} />}
//         {step === 7 && (
//           <div className="text-center text-[#1b68b3]">
//             <h1 className="text-2xl font-bold mb-6">Thanks for your interest</h1>
//             <p className="text-lg" style={{ color: '#1b68b3' }}>We will get back to you soon.</p>
//           </div>
//         )}
//         {step !== 7 && (
//           <div className="text-center mt-4">
//             <span className="text-gray-600">Already have a registered account? </span>
//             <Link to="/sub-admin/login" className="hover:underline font-medium" style={{ color: '#1b68b3' }}>
//               Sign in
//             </Link>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default RegisterInstitute;


