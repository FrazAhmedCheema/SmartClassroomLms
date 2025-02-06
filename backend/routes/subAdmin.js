const express = require('express');
const router = express.Router();
const subAdminController = require('../controllers/subAdmin');
const { authorizeSubAdmin } = require('../middleware/auth');

router.get('/dashboard', authorizeSubAdmin, (req, res) => {
    console.log('Dashboard route accessed'); 
    res.status(200).send('Authorized');
});

router.post('/registerInstitute', subAdminController.registerInstitute);
router.post('/add-student', authorizeSubAdmin, subAdminController.addStudent);
router.get('/students', authorizeSubAdmin, subAdminController.getStudents);
router.put('/edit-student/:id', authorizeSubAdmin, subAdminController.editStudent);
router.delete('/delete-student/:id', authorizeSubAdmin, subAdminController.deleteStudent);

// Teacher routes
router.post('/add-teacher', authorizeSubAdmin, subAdminController.addTeacher);
router.get('/teachers', authorizeSubAdmin, subAdminController.getTeachers);
router.put('/edit-teacher/:id', authorizeSubAdmin, subAdminController.editTeacher);
router.delete('/delete-teacher/:id', authorizeSubAdmin, subAdminController.deleteTeacher);

// Login route
router.post('/login', subAdminController.login);
router.post('/logout', authorizeSubAdmin, subAdminController.logout);

// Import students route
router.post('/import-students', authorizeSubAdmin, subAdminController.importStudents);

module.exports = router;