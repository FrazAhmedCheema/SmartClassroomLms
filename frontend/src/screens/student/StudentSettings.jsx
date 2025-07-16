import React, { useState } from 'react';
import { Lock, Eye, EyeOff, Save } from 'lucide-react';
import axios from 'axios';

const StudentSettings = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match!' });
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await axios.post('http://localhost:8080/student/change-password', {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      }, {
        withCredentials: true
      });
      setIsSubmitting(false);
      setMessage({ type: 'success', text: res.data.message || 'Password updated successfully!' });
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      setIsSubmitting(false);
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update password.' });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Change Password</h1>
        <div className="bg-white rounded-xl shadow-md p-6">
          {message.text && (
            <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {message.text}
            </div>
          )}
          <form onSubmit={handlePasswordSubmit}>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <Lock size={16} />
                    <span>Current Password</span>
                  </div>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1b68b3]/20 focus:border-[#1b68b3] transition-all duration-200 bg-white text-gray-800 pr-10"
                    placeholder="Enter current password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1b68b3] focus:outline-none focus:ring-2 focus:ring-[#1b68b3]/40 p-1 rounded-full transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} strokeWidth={2.2} /> : <Eye size={20} strokeWidth={2.2} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <Lock size={16} />
                    <span>New Password</span>
                  </div>
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1b68b3]/20 focus:border-[#1b68b3] transition-all duration-200 bg-white text-gray-800 pr-10"
                    placeholder="Enter new password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    tabIndex={-1}
                    aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1b68b3] focus:outline-none focus:ring-2 focus:ring-[#1b68b3]/40 p-1 rounded-full transition-colors"
                  >
                    {showNewPassword ? <EyeOff size={20} strokeWidth={2.2} /> : <Eye size={20} strokeWidth={2.2} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <Lock size={16} />
                    <span>Confirm New Password</span>
                  </div>
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1b68b3]/20 focus:border-[#1b68b3] transition-all duration-200 bg-white text-gray-800"
                  placeholder="Confirm new password"
                  required
                />
              </div>
            </div>
            <div className="mt-8">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-[#1b68b3] text-white rounded-lg hover:bg-[#145091] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Updating...</span>
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    <span>Update Password</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StudentSettings;
