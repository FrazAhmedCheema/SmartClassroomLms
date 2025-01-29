import React, { useState } from 'react';
import ComposeEmailModal from './ComposeEmailModal';

const InstitutesTable = ({ institutes, setInstitutes, setFilteredInstitutes }) => {
  const [editableInstituteId, setEditableInstituteId] = useState(null);
  const [editFormData, setEditFormData] = useState({ status: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInstitute, setSelectedInstitute] = useState(null);

  const handleEditClick = (institute) => {
    setEditableInstituteId(institute._id);
    setEditFormData({ status: institute.status });
  };

  const handleSaveClick = async (id) => {
    try {
      const response = await fetch(`http://localhost:8080/admin/manage-institutes/${id}/status`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: editFormData.status }),
      });

      if (!response.ok) throw new Error('Failed to update institute status');

      const updatedInstitute = await response.json();
      const updatedInstitutes = institutes.map((institute) =>
        institute._id === id ? updatedInstitute.institute : institute
      );

      setInstitutes(updatedInstitutes);
      setFilteredInstitutes(updatedInstitutes);
      setEditableInstituteId(null);
    } catch (error) {
      console.error('Error updating institute status:', error.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:8080/admin/manage-institutes/${id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) throw new Error('Failed to delete institute');

      const updatedInstitutes = institutes.filter((institute) => institute._id !== id);
      setInstitutes(updatedInstitutes);
      setFilteredInstitutes(updatedInstitutes);
      alert(`Institute with ID: ${id} deleted successfully.`);
    } catch (error) {
      console.error('Error deleting institute:', error.message);
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
        body: JSON.stringify({ subject, body }),
      });

      if (!response.ok) throw new Error('Failed to send email');

      alert(`Email sent successfully to ${selectedInstitute.instituteName}`);
    } catch (error) {
      console.error('Error sending email:', error.message);
    }
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
              <td className="px-6 py-4">{institute.instituteId}</td>
              <td className="px-6 py-4">{institute.instituteName}</td>
              <td className="px-6 py-4">{institute.instituteAdminName}</td>
              <td className="px-6 py-4">
                {editableInstituteId === institute._id ? (
                  <select
                    name="status"
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({ status: e.target.value })}
                    className="w-full px-2 py-1 border rounded bg-white text-black"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                ) : (
                  institute.status
                )}
              </td>
              <td className="px-6 py-4">
                <div className="flex space-x-2">
                  {editableInstituteId === institute._id ? (
                    <button
                      onClick={() => handleSaveClick(institute._id)}
                      className="bg-green-600 text-white px-3 py-1 rounded text-sm"
                    >
                      Save
                    </button>
                  ) : (
                    <button
                      onClick={() => handleEditClick(institute)}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
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
