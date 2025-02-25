import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { joinClass } from '../../redux/slices/enrolledClassesSlice';
import Swal from 'sweetalert2';

const JoinClassModal = ({ isOpen, onClose }) => {
  const [classCode, setClassCode] = useState('');
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const resultAction = await dispatch(joinClass(classCode)).unwrap();
      Swal.fire({
        title: 'Success!',
        text: 'You have successfully joined the class',
        icon: 'success',
        confirmButtonColor: '#1b68b3',
      });
      setClassCode('');
      onClose();
    } catch (error) {
      Swal.fire({
        title: 'Error!',
        text: error.message || 'Failed to join class',
        icon: 'error',
        confirmButtonColor: '#1b68b3',
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Join a Class</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Class Code
            </label>
            <input
              type="text"
              value={classCode}
              onChange={(e) => setClassCode(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50"
              placeholder="Enter class code"
              required
            />
          </div>
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-[#1b68b3] hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Join Class
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JoinClassModal;
