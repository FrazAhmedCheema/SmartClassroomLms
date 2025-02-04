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
          const response = await fetch(`http://localhost:8080/admin/manage-institutes/${id}`, {
            method: 'PUT',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(editFormData),
          });

          if (!response.ok) throw new Error('Failed to update institute');

          const data = await response.json();

          if (data.success) {
            const updatedInstitutes = institutes.map((institute) =>
              institute._id === id ? { ...institute, ...editFormData } : institute
            );

            setInstitutes(updatedInstitutes);
            setFilteredInstitutes(updatedInstitutes);
            setEditableInstituteId(null);

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
          const response = await fetch(`http://localhost:8080/admin/manage-institutes/${id}`, {
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
      const response = await fetch(`http://localhost:8080/admin/manage-institutes/${selectedInstitute._id}/email`, {
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
          <tr className="bg-gray-100 text-gray-800">
            <th className="px-6 py-3 text-left">InstituteID</th>
            <th className="px-6 py-3 text-left">Name</th>
            <th className="px-6 py-3 text-left">Admin</th>
            <th className="px-6 py-3 text-left">Status</th>
            <th className="px-6 py-3 text-left">Actions</th>
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
        recipientEmail={selectedInstitute?.instituteName || ''}
      />
    </>
  );
};

export default InstitutesTable;





