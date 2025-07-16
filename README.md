# 📚 SmartClassroomLMS

[![MERN Stack](https://img.shields.io/badge/Stack-MERN-green.svg)](https://reactjs.org/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-v18+-brightgreen.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-v19.0.0-blue.svg)](https://reactjs.org/)

SmartClassroomLMS is a comprehensive **Learning Management System (LMS)** built with the **MERN stack** that revolutionizes educational management. It provides a complete solution for institutes, teachers, and students to manage courses, assignments, discussions, and assessments efficiently.

## 🌟 Key Features

### 🏛️ Multi-Level Administration
- **Primary Admin**: Approves institute requests and oversees the entire system
- **Sub-Admin (Institute Admin)**: Manages students, teachers, and institutional operations
- **Teacher Dashboard**: Course creation, assignment management, and student evaluation
- **Student Portal**: Course enrollment, assignment submission, and collaboration

### 🔐 Secure Authentication & Authorization
- JWT-based authentication with role-based access control
- Secure session management with HTTP-only cookies
- Domain-based user validation for institutional security
- Email verification for account activation

### 🎓 Comprehensive Classroom Management
- **Virtual Classrooms**: Create and manage multiple classes with unique codes
- **Course Materials**: Upload and organize lecture materials, documents, and resources
- **Topic Organization**: Categorize content by topics for better structure
- **Real-time Announcements**: Instant notifications for class updates

### 📝 Advanced Assignment System
- **Multiple Assignment Types**: Support for various programming languages (Java, C++, Python, JavaScript/MERN)
- **File Upload & Management**: Secure file handling with AWS S3 integration
- **Due Date Management**: Automatic late submission tracking
- **Private Comments**: Student-teacher communication on submissions

### 💻 Integrated Code Execution Environment
- **Multi-Language Support**: Execute code in Java, C++, Python, and JavaScript
- **Interactive Terminal**: Real-time code execution with WebSocket integration
- **MERN Stack Deployment**: Automatic deployment and testing of full-stack applications
- **AI-Powered Error Analysis**: Intelligent compilation error detection and suggestions
- **VS Code Integration**: Direct code viewing in VS Code from the browser

### 🔍 Advanced Plagiarism Detection
- **JPlag Integration**: Industry-standard plagiarism detection for programming assignments
- **Automated Analysis**: Batch processing of student submissions
- **Detailed Reports**: Comprehensive similarity reports with visual comparisons
- **Source Code Analysis**: Support for multiple programming languages

### 📊 Assessment & Grading
- **Quiz System**: Create and manage quizzes with multiple question types
- **Automated Grading**: Smart grading system with manual override options
- **Grade Analytics**: Performance tracking and statistical analysis
- **Feedback System**: Detailed teacher feedback on student work

### 💬 Communication & Collaboration
- **Discussion Forums**: Topic-based discussions with threading support
- **Real-time Messaging**: Instant messaging within discussions
- **Announcement System**: Class-wide announcements with comment support
- **Notification Center**: Real-time notifications for all activities

### 📈 Analytics & Reporting
- **Dashboard Analytics**: Comprehensive stats for all user roles
- **Performance Tracking**: Student progress monitoring
- **Activity Logs**: Detailed system activity tracking
- **Export Capabilities**: Data export for external analysis

## 🛠️ Technology Stack

### Frontend
- **React.js 19.0.0** - Modern UI framework
- **Tailwind CSS** - Utility-first CSS framework
- **Redux Toolkit** - State management
- **Framer Motion** - Smooth animations
- **Axios** - HTTP client
- **Chart.js** - Data visualization
- **Monaco Editor** - Code editing
- **XTerm.js** - Terminal emulation
- **Socket.io Client** - Real-time communication

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **Socket.io** - Real-time communication
- **WebSocket** - Interactive terminal sessions
- **JWT** - Authentication tokens
- **Bcrypt** - Password hashing
- **Multer** - File upload handling

### Cloud & Storage
- **AWS S3** - File storage
- **MongoDB Atlas** - Cloud database
- **Email Service** - Automated notifications
- **Docker** - Code execution containers

### Development Tools
- **Vite** - Build tool
- **ESLint** - Code linting
- **Nodemon** - Development server
- **Postman** - API testing

## 📋 Prerequisites

Before running this project, make sure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **MongoDB** (local or Atlas)
- **Git**

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/SmartClassroomLms.git
cd SmartClassroomLms
```

### 2. Backend Setup
```bash
cd backend
npm install

# Create .env file
cp .env.example .env
```

Configure your environment variables in `.env`:
```env
# Database
MONGO_URI=mongodb://localhost:27017/smartclassroom
# or for MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/smartclassroom

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key

# Email Configuration
EMAIL_USER=your-email@domain.com
EMAIL_PASS=your-email-password

# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=your-aws-region
AWS_BUCKET_NAME=your-bucket-name

# OpenAI API (for code analysis)
OPENAI_API_KEY=your-openai-api-key

# Server Configuration
PORT=8080
NODE_ENV=development
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install

# Create .env file if needed for environment-specific configurations
```

### 4. Database Setup
Make sure MongoDB is running locally or configure MongoDB Atlas connection.

### 5. Start the Application

#### Development Mode
```bash
# Start backend (from backend directory)
npm start

# Start frontend (from frontend directory)
npm run dev
```

#### Production Mode
```bash
# Build frontend
cd frontend
npm run build

# Start backend in production
cd ../backend
NODE_ENV=production npm start
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:8080

## 🗂️ Project Structure

```
SmartClassroomLms/
├── backend/
│   ├── controllers/          # Request handlers
│   ├── models/              # Database schemas
│   ├── routes/              # API routes
│   ├── middleware/          # Authentication & validation
│   ├── services/            # Business logic
│   ├── utils/               # Utility functions
│   ├── uploads/             # File uploads
│   └── app.js               # Server entry point
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── screens/         # Page components
│   │   ├── redux/           # State management
│   │   ├── hooks/           # Custom React hooks
│   │   ├── layouts/         # Layout components
│   │   └── assets/          # Static assets
│   ├── public/              # Public assets
│   └── package.json
└── README.md
```

## 👥 User Roles & Permissions

### 🛡️ Primary Admin
- Approve/reject institute registration requests
- Manage all institutes and users
- System-wide analytics and monitoring
- Email notifications to institutes

### 🏢 Sub-Admin (Institute Admin)
- Register institute and verify email
- Manage students and teachers within institute
- View class analytics and reports
- Import users via CSV files

### 👨‍🏫 Teacher
- Create and manage virtual classrooms
- Upload course materials and resources
- Create assignments, quizzes, and assessments
- Grade submissions and provide feedback
- Run plagiarism checks on assignments
- Execute and test student code
- Manage class discussions and announcements

### 👨‍🎓 Student
- Join classes using class codes
- Access course materials and resources
- Submit assignments and take quizzes
- Participate in class discussions
- View grades and feedback
- Track academic progress

## 🔌 API Endpoints

### Authentication
```
POST /admin/login              # Admin login
POST /sub-admin/login          # Sub-admin login
POST /teacher/login            # Teacher login
POST /student/login            # Student login
GET  /*/check-auth            # Check authentication status
POST /*/logout                # Logout
```

### Class Management
```
GET    /class/:id/basic       # Get class basic info
POST   /class/create          # Create new class
POST   /class/:id/join        # Join class with code
GET    /class/:id/students    # Get class students
POST   /class/announcement    # Create announcement
```

### Assignments & Submissions
```
POST   /assignment/:classId/create    # Create assignment
GET    /assignment/:classId           # Get assignments
POST   /submission/:assignmentId/submit # Submit assignment
GET    /submission/all/:assignmentId  # Get all submissions
POST   /submission/grade/:submissionId # Grade submission
```

### Code Execution
```
POST   /code/execute          # Execute code batch
POST   /code/interactive      # Start interactive session
GET    /code/view/:submissionId # View code in VS Code
```

### Plagiarism Detection
```
POST   /api/plagiarism/check/:assignmentId    # Run plagiarism check
GET    /api/plagiarism/results/:assignmentId  # Get results
GET    /api/plagiarism/report/:reportId       # View report
```

## 🔧 Configuration

### Email Configuration
The system uses SMTP for email notifications. Configure your email provider in the backend `.env` file:

```env
EMAIL_USER=your-email@domain.com
EMAIL_PASS=your-app-password
```

### AWS S3 Configuration
For file storage, configure AWS S3:

```env
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
AWS_BUCKET_NAME=your-bucket-name
```

### Code Execution
The system supports multiple programming languages with containerized execution environments:

- **Java, C++, Python**: No installation required - executed in secure containers
- **Node.js & npm**: Required for JavaScript/MERN project execution and deployment

## 📊 Features in Detail

### Code Execution System
- **Multi-language Support**: Java, C++, Python, JavaScript/MERN
- **Interactive Terminals**: Real-time code execution with WebSocket
- **Error Analysis**: AI-powered compilation error detection
- **Container Isolation**: Secure execution environment
- **MERN Deployment**: Automatic full-stack application deployment

### Plagiarism Detection
- **JPlag Integration**: Industry-standard similarity detection
- **Multiple Languages**: Support for all programming languages
- **Visual Reports**: Side-by-side code comparison
- **Batch Processing**: Automated analysis of all submissions

### Discussion System
- **Threaded Conversations**: Nested reply system
- **Real-time Updates**: Live message updates
- **File Attachments**: Share files in discussions
- **Moderation Tools**: Teacher controls for discussions

### Notification System
- **Real-time Notifications**: Instant updates via WebSocket
- **Email Notifications**: Important updates via email
- **Categorized Alerts**: Different types for different activities
- **Mark as Read**: Track notification status

## 🧪 Testing

### Running Tests
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### API Testing
Use the provided Postman collection for API testing:
```bash
# Import postman collection
postman collection run SmartClassroomLMS.postman_collection.json
```

## 🚀 Deployment

### Production Deployment

1. **Build the frontend**:
```bash
cd frontend
npm run build
```

2. **Configure environment variables** for production

3. **Deploy to your preferred platform**:
   - **Heroku**: Use the provided Procfile
   - **DigitalOcean**: Use Docker containers
   - **AWS**: Deploy on EC2 with Load Balancer

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up --build
```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-based Access Control**: Granular permissions system
- **Domain Validation**: Institute-specific user access
- **File Upload Security**: Virus scanning and type validation
- **SQL Injection Prevention**: Parameterized queries
- **XSS Protection**: Input sanitization and validation

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'Add amazing feature'`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines
- Follow ESLint configuration
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🛠️ Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   ```bash
   # Make sure MongoDB is running
   sudo systemctl start mongod
   ```

2. **Port Already in Use**
   ```bash
   # Kill process on port 8080
   lsof -ti:8080 | xargs kill -9
   ```

3. **NPM Installation Issues**
   ```bash
   # Clear npm cache
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   ```

4. **Code Execution Not Working**
   - Ensure required compilers are installed
   - Check Docker installation for containerized execution
   - Verify file permissions for uploads directory

## 📞 Support

For support and questions:

- **Email**: fraz.ahmed.cheema@gmail.com
- **GitHub Issues**: [Create an issue](https://github.com/yourusername/SmartClassroomLms/issues)
- **Documentation**: [Wiki](https://github.com/yourusername/SmartClassroomLms/wiki)

## 🙏 Acknowledgments

- **MongoDB** for the excellent NoSQL database
- **React Team** for the amazing frontend framework
- **Express.js** for the robust backend framework
- **JPlag** for plagiarism detection capabilities
- **OpenAI** for AI-powered code analysis
- **AWS** for reliable cloud storage

## 📈 Future Enhancements

- [ ] Mobile application (React Native)
- [ ] Advanced analytics and reporting
- [ ] Video conferencing integration
- [ ] Automated testing for student code
- [ ] Machine learning for personalized learning
- [ ] Blockchain-based certificate generation
- [ ] Advanced plagiarism detection algorithms
- [ ] Integration with external LMS platforms

---

**SmartClassroomLMS** - Transforming education through technology 🚀

Made with ❤️ by the SmartClassroom Team  
