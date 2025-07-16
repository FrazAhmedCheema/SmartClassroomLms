const Class = require('../models/Class');
const Teacher = require('../models/teacher');

exports.getClassBasicInfo = async (req, res) => {
  const { classId } = req.params;

  if (!classId) {
    return res.status(400).json({
      success: false,
      message: 'Class ID is required'
    });
  }

  try {
    const classData = await Class.findById(classId).populate('createdBy', 'name email');
    if (!classData) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }

    res.status(200).json({
      success: true,
      class: classData
    });
  } catch (error) {
    console.error('Error fetching class info:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch class info',
      error: error.message
    });
  }
};

exports.getPeople = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      success: false,
      message: 'Class ID is required'
    });
  }

  try {
    const classData = await Class.findById(id)
      .populate('teacherId', 'name email')
      .populate('additionalTeachers', 'name email')
      .populate('students', 'name email registrationId');

    if (!classData) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }

    // Combine main teacher and additional teachers
    const allTeachers = [classData.teacherId];
    if (classData.additionalTeachers && classData.additionalTeachers.length > 0) {
      allTeachers.push(...classData.additionalTeachers);
    }

    res.status(200).json({
      success: true,
      people: {
        teachers: allTeachers,
        students: classData.students || []
      }
    });
  } catch (error) {
    console.error('Error fetching class people:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch class people',
      error: error.message
    });
  }
};

exports.addTeacher = async (req, res) => {
  const { id } = req.params;
  const { email } = req.body;
  const requestingUserId = req.user.id;

  if (!id || !email) {
    return res.status(400).json({
      success: false,
      message: 'Class ID and teacher email are required'
    });
  }

  try {
    // Find the class and verify the requesting user is a teacher of this class
    const classData = await Class.findById(id);
    if (!classData) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }

    // Check if the requesting user is the main teacher or an additional teacher
    const isMainTeacher = classData.teacherId.toString() === requestingUserId;
    const isAdditionalTeacher = classData.additionalTeachers && 
      classData.additionalTeachers.some(teacherId => teacherId.toString() === requestingUserId);

    if (!isMainTeacher && !isAdditionalTeacher) {
      return res.status(403).json({
        success: false,
        message: 'Only teachers of this class can add other teachers'
      });
    }

    // Find the teacher by email
    const teacherToAdd = await Teacher.findOne({ email: email.toLowerCase() });
    if (!teacherToAdd) {
      return res.status(404).json({
        success: false,
        message: 'Teacher with this email not found'
      });
    }

    // Check if teacher is already the main teacher
    if (classData.teacherId.toString() === teacherToAdd._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'This teacher is already the main teacher of this class'
      });
    }

    // Check if teacher is already an additional teacher
    if (classData.additionalTeachers && 
        classData.additionalTeachers.some(teacherId => teacherId.toString() === teacherToAdd._id.toString())) {
      return res.status(400).json({
        success: false,
        message: 'This teacher is already added to this class'
      });
    }

    // Add the teacher to additionalTeachers array
    classData.additionalTeachers = classData.additionalTeachers || [];
    classData.additionalTeachers.push(teacherToAdd._id);
    await classData.save();

    // Also add this class to the teacher's classes array
    await Teacher.findByIdAndUpdate(teacherToAdd._id, { 
      $addToSet: { classes: classData._id } 
    });

    // Return the added teacher info
    res.status(200).json({
      success: true,
      message: 'Teacher added successfully',
      teacher: {
        _id: teacherToAdd._id,
        name: teacherToAdd.name,
        email: teacherToAdd.email
      }
    });
  } catch (error) {
    console.error('Error adding teacher to class:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add teacher to class',
      error: error.message
    });
  }
};
