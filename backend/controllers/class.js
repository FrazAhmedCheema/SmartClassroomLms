const Class = require('../models/Class');
const Teacher = require('../models/teacher');
const Student = require('../models/student');
const Discussion = require('../models/Discussion');

exports.getClassById = async (req, res) => {
    try {
        // Validate user information
        if (!req.user || !req.user.id || !req.user.role) {
            return res.status(401).json({
                success: false,
                message: 'User information missing'
            });
        }

        const { id } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;

        // Find the class by ID and populate students and teacher
        const classData = await Class.findById(id)
            .populate({
                path: 'students',
                select: 'name email registrationId'
            })
            .populate({
                path: 'teacherId',
                select: 'name email'
            });

        if (!classData) {
            return res.status(404).json({
                success: false,
                message: 'Class not found'
            });
        }

        // Verify access rights
        if (userRole === 'teacher' && classData.teacherId._id.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to access this class'
            });
        } else if (userRole === 'student') {
            const student = await Student.findById(userId);
            if (!student.enrolledClasses || !student.enrolledClasses.includes(id)) {
                return res.status(403).json({
                    success: false,
                    message: 'You are not enrolled in this class'
                });
            }
        }

        // Format students array
        const formattedStudents = classData.students.map(student => ({
            id: student._id,
            name: student.name,
            email: student.email,
            registrationId: student.registrationId
        }));

        const formattedResponse = {
            _id: classData._id,
            className: classData.className,
            section: classData.section,
            classCode: classData.classCode,
            teacherId: classData.teacherId._id,
            students: formattedStudents,
            teachers: [
                {
                    id: classData.teacherId._id,
                    name: classData.teacherId.name,
                    email: classData.teacherId.email
                }
            ],
            coverImage: 'https://gstatic.com/classroom/themes/img_code.jpg',
            announcements: [
                {
                    id: 1,
                    author: classData.teacherId.name,
                    authorRole: 'Teacher',
                    content: 'Welcome to our class! Please review the syllabus and let me know if you have any questions.',
                    createdAt: new Date().toISOString(),
                    attachments: [],
                }
            ],
            createdAt: classData.createdAt
        };

        res.status(200).json({
            success: true,
            class: formattedResponse
        });
    } catch (error) {
        console.error('Error in getClassById:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching class details',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

exports.getBasicClassInfo = async (req, res) => {
  try {
    const classData = await Class.findById(req.params.id)
      .select('className section teacherId coverImage announcements classCode') // Added classCode here
      .populate('teacherId', 'name email');

    if (!classData) {
      return res.status(404).json({ 
        success: false, 
        message: 'Class not found' 
      });
    }

    const formattedResponse = {
      _id: classData._id,
      className: classData.className,
      section: classData.section,
      classCode: classData.classCode, // Make sure this is included
      teacherId: classData.teacherId._id,
      teacher: {
        name: classData.teacherId.name,
        email: classData.teacherId.email
      },
      coverImage: classData.coverImage || 'https://gstatic.com/classroom/themes/img_code.jpg',
      announcements: classData.announcements || []
    };

    res.json({ success: true, class: formattedResponse });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getClasswork = async (req, res) => {
  try {
    const classwork = await Class.findById(req.params.id)
      .select('assignments')
      .populate('assignments');
    res.json({ success: true, classwork: classwork.assignments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getPeople = async (req, res) => {
  try {
    const people = await Class.findById(req.params.id)
      .select('students teacherId')
      .populate('students', 'name email registrationId')
      .populate('teacherId', 'name email');
    res.json({ success: true, people: { teacher: people.teacherId, students: people.students } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getDiscussionById = async (req, res) => {
  try {
    const { id, topicId } = req.params;
    const classData = await Class.findById(id)
      .select('discussions')
      .populate({
        path: 'discussions',
        match: { _id: topicId },
        populate: {
          path: 'author',
          select: 'name email'
        }
      });

    const discussion = classData?.discussions?.find(d => d._id.toString() === topicId);
    
    if (!discussion) {
      return res.status(404).json({ 
        success: false, 
        message: 'Discussion not found' 
      });
    }

    res.json({ 
      success: true, 
      discussion 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

exports.getClassworkById = async (req, res) => {
  try {
    const { id, assignmentId } = req.params;
    const classData = await Class.findById(id)
      .select('assignments')
      .populate({
        path: 'assignments',
        match: { _id: assignmentId }
      });

    if (!classData?.assignments?.length) {
      return res.status(404).json({ 
        success: false, 
        message: 'Assignment not found' 
      });
    }

    res.json({ 
      success: true, 
      assignment: classData.assignments[0] 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

exports.getDiscussions = async (req, res) => {
  try {
    console.log('Fetching discussions for class:', req.params.id);
    
    const classData = await Class.findById(req.params.id)
      .select('discussions')
      .populate({
        path: 'discussions',
        populate: [{
          path: 'author',
          select: 'name email'
        }, {
          path: 'messages.author',
          select: 'name email'
        }]
      });

    if (!classData) {
      console.log('Class not found');
      return res.status(404).json({ 
        success: false, 
        message: 'Class not found' 
      });
    }

    // Add debug logging
    console.log('Found discussions:', classData.discussions?.length || 0);
    console.log('Discussion IDs:', classData.discussions?.map(d => d._id));

    res.json({ 
      success: true, 
      discussions: classData.discussions || [] 
    });
  } catch (error) {
    console.error('Error in getDiscussions:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};
