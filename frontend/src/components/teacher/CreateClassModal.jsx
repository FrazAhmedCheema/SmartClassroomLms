// import React, { useState } from 'react';
// import { X } from 'lucide-react';

// const CreateClassModal = ({ isOpen, onClose, onCreate }) => {
//   const [className, setClassName] = useState('');
//   const [section, setSection] = useState('');

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     onCreate({ className, section });
//     setClassName('');
//     setSection('');
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//       <div className="bg-white rounded-lg p-6 w-96 shadow-xl">
//         <div className="flex justify-between items-center mb-4">
//           <h2 className="text-xl font-bold" style={{color:"#1b68b3"}}>Create New Class</h2>
//           <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
//             <X size={20} />
//           </button>
//         </div>
//         <form onSubmit={handleSubmit}>
//           <div className="space-y-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Class Name <span className="text-red-500">*</span>
//               </label>
//               <input
//                 type="text"
//                 value={className}
//                 onChange={(e) => setClassName(e.target.value)}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md 
//                 focus:outline-none focus:ring-1 focus:ring-[#1b68b3] focus:bg-white
//                 transition-colors duration-200 text-gray-900"
//                 placeholder="Enter class name"
//                 required
//                 style={{ backgroundColor: "#f3f4f6" }}
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Section <span className="text-red-500">*</span>
//               </label>
//               <input
//                 type="text"
//                 value={section}
//                 onChange={(e) => setSection(e.target.value)}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md 
//                 focus:outline-none focus:ring-1 focus:ring-[#1b68b3] focus:bg-white
//                 transition-colors duration-200 text-gray-900"
//                 placeholder="Enter section"
//                 required
//                 style={{ backgroundColor: "#f3f4f6" }}
//               />
//             </div>
//           </div>
//           <div className="flex justify-end items-center gap-6 mt-6">
//             <button
//               type="button"
//               onClick={onClose}
//               className="text-gray-600 hover:underline focus:outline-none"
//               style={{ background: "none", border: "none", padding: 0 }}
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               className="px-4 py-2 bg-[#1b68b3] text-white rounded-md hover:bg-[#145091] transition-colors"
//             >
//               Create
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default CreateClassModal;










import React, { useState } from 'react';
import { X } from 'lucide-react';

const CreateClassModal = ({ isOpen, onClose, onCreate }) => {
  const [className, setClassName] = useState('');
  const [section, setSection] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    const trimmedClassName = className.trim();
    const trimmedSection = section.trim();

    if (!trimmedClassName || !trimmedSection) {
      setError('Class Name and Section cannot be empty or just spaces.');
      return;
    }

     onCreate({ className, section });
    setClassName('');
    setSection('');
    setError('');
    onClose(); // Optionally close modal after creation
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold" style={{ color: "#1b68b3" }}>Create New Class</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Class Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md 
                focus:outline-none focus:ring-1 focus:ring-[#1b68b3] focus:bg-white
                transition-colors duration-200 text-gray-900"
                placeholder="Enter class name"
                required
                style={{ backgroundColor: "#f3f4f6" }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Section <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={section}
                onChange={(e) => setSection(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md 
                focus:outline-none focus:ring-1 focus:ring-[#1b68b3] focus:bg-white
                transition-colors duration-200 text-gray-900"
                placeholder="Enter section"
                required
                style={{ backgroundColor: "#f3f4f6" }}
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>
          <div className="flex justify-end items-center gap-6 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="text-gray-600 hover:underline focus:outline-none"
              style={{ background: "none", border: "none", padding: 0 }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#1b68b3] text-white rounded-md hover:bg-[#145091] transition-colors"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateClassModal;
