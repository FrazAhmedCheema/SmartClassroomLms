import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye } from "lucide-react";
import logo from "../../assets/logo.png";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");

  const validate = () => {
    const errors = {};
    if (!formData.username) {
      errors.username = "Username or Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.username)) {
      errors.username = "Email format is invalid";
    }
    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 4) {
      errors.password = "Password must be at least 6 characters long";
    }
    return errors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
    } else {
      fetch("http://localhost:8080/admin/login", { 
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
        credentials: "include",
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.statusText}`);
          }
          return response.json();
        })
        .then((data) => {
          if (data.error) {
            setServerError(data.error);
          } else {
            console.log("Form submitted:", data);
            navigate("/admin/dashboard");
          }
        })
        .catch((error) => {
          console.error("Fetch error:", error);
          setServerError(`An unexpected error occurred: ${error.message}`);
        });
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setErrors({
      ...errors,
      [e.target.name]: "",
    });
    setServerError("");
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-full max-w-md p-8 bg-blue-50 rounded-lg shadow-md">
        <div className="text-center mb-8">
          <img src={logo} alt="Logo" className="h-16 mt-2 mx-auto" />
          <h2 className="text-xl mt-2" style={{ color: '#1b68b3' }}>
            LOGIN TO YOUR ADMIN DASHBOARD
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-600 mb-2">Username or Email</label>
            <div className="flex">
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                 placeholder="Enter username or email"
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#155a8a] bg-white text-black"
              />
            </div>
            {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username}</p>}
          </div>

          <div>
            <label className="block text-gray-600 mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter password"
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#155a8a] bg-white text-black"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-white p-1 rounded-full"
              >
                <Eye className="h-5 w-5 text-black" />
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            <div className="text-right mt-1">
              <Link to="/forget-password" className="text-sm hover:underline" style={{ color: '#1b68b3' }}>
                Forget Password
              </Link>
            </div>
          </div>

          {serverError && <p className="text-red-500 text-sm mt-1">{serverError}</p>}

          <button
            type="submit"
            className="w-full text-white py-2 px-4 rounded-md transition-colors bg-[#155a8a] hover:bg-[#104a6e]"
          >
            LOGIN
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;