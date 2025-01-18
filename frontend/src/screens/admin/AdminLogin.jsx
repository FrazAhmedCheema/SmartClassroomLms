import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye } from "lucide-react";

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
    } else if (formData.password.length < 6) {
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
      fetch("http://localhost:8080/admin/login", { // Ensure this URL is correct
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
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
            navigate("/admin-dashboard");
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

  const handleDummyLogin = () => {
    navigate("/admin-dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
      <div className="w-full max-w-md p-8 rounded-lg bg-white shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl mt-2 text-[#155a8a]">
            Smart Classr
            {/* <span className="inline-block">
              <span className="text-[#155a8a]">😊</span>
              <span className="text-[#155a8a]">😊</span>
            </span> */}
            oom
          </h1>
          <h2 className="text-xl mt-2 text-[#155a8a]">
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
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-[#155a8a] bg-white text-black"
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
              <Link to="/forget-password" className="text-sm hover:underline text-[#155a8a]">
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

        <button
          onClick={handleDummyLogin}
          className="w-full mt-4 text-white py-2 px-4 rounded-md transition-colors bg-gray-500 hover:bg-gray-700"
        >
          Dummy Login
        </button>
      </div>
    </div>
  );
};

export default AdminLogin;