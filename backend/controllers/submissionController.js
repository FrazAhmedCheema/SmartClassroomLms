const Submission = require('../models/Submission');
const Assignment = require('../models/Assignment');
const { uploadFile, deleteFile } = require('../utils/s3Service');
const Quiz = require('../models/Quiz');
const { createGradeNotification } = require('../utils/notificationHelper');
const Teacher = require('../models/teacher');

exports.submitAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { privateComment, existingFiles } = req.body;
    const studentId = req.user.id;

    // Parse existing files from JSON string
    const existingFilesArray = existingFiles ? JSON.parse(existingFiles) : [];

    // Create submission attachments array from new uploaded files
    let newSubmissionFiles = [];
    if (req.files && req.files.length > 0) {
      try {
        for (const file of req.files) {
          const key = `submissions/${assignmentId}/${studentId}/${Date.now()}-${file.originalname}`;
          const uploadResult = await uploadFile(file, key);
          
          newSubmissionFiles.push({
            fileName: file.originalname,
            fileType: file.mimetype,
            key: key,
            url: uploadResult.Location
          });
        }
      } catch (error) {
        console.error('Error uploading new files:', error);
        return res.status(500).json({
          success: false,
          message: 'Error uploading new files',
          error: error.message
        });
      }
    }

    // Get assignment to check due date
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    // Check if submission is late
    const now = new Date();
    const isLate = assignment.dueDate && now > new Date(assignment.dueDate);

    // Combine existing and new files
    const allFiles = [...existingFilesArray, ...newSubmissionFiles];

    // Create or update submission
    const submissionData = {
      assignmentId,
      studentId,
      files: allFiles,
      privateComment: privateComment || '',
      submittedAt: Date.now(),
      status: 'submitted',
      isLate: isLate
    };

    const savedSubmission = await Submission.findOneAndUpdate(
      { assignmentId, studentId },
      submissionData,
      { new: true, upsert: true }
    );

    // Update assignment's studentSubmissions array if needed
    if (!assignment.studentSubmissions.includes(savedSubmission._id)) {
      assignment.studentSubmissions.push(savedSubmission._id);
      await assignment.save();
    }

    res.status(200).json({
      success: true,
      message: 'Assignment submitted successfully',
      submission: savedSubmission
    });
  } catch (error) {
    console.error('Error submitting assignment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit assignment',
      error: error.message
    });
  }
};

exports.addOrUpdatePrivateComment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { privateComment } = req.body;
    const studentId = req.user._id;

    console.log(`Adding private comment for assignment: ${assignmentId}, student: ${studentId}`);
    
    if (!privateComment && privateComment !== '') {
      return res.status(400).json({
        success: false,
        message: 'Private comment is required'
      });
    }

    // Find existing submission or create a new one
    let submission = await Submission.findOne({ assignmentId, studentId });
    
    if (submission) {
      console.log(`Updating private comment for existing submission: ${submission._id}`);
      submission.privateComment = privateComment;
      await submission.save();
    } else {
      console.log('Creating new submission with only private comment');
      submission = new Submission({
        assignmentId,
        studentId,
        privateComment,
        files: [],
        status: 'submitted'
      });
      await submission.save();
    }

    console.log('Private comment saved successfully');
    
    res.status(200).json({
      success: true,
      message: 'Private comment updated successfully',
      submission
    });
  } catch (error) {
    console.error('Error updating private comment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update private comment',
      error: error.message
    });
  }
};

exports.getStudentSubmission = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const studentId = req.user.id;

    console.log('Fetching submission:', { assignmentId, studentId });

    // Populate assignment data to get points
    const submission = await Submission.findOne({ 
      assignmentId, 
      studentId 
    }).populate('assignmentId', 'title points');

    console.log('Found submission:', submission);

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'No submission found for this assignment'
      });
    }

    res.status(200).json({
      success: true,
      submission: {
        _id: submission._id,
        files: submission.files,
        privateComment: submission.privateComment,
        submittedAt: submission.submittedAt,
        status: submission.status,
        grade: submission.grade,
        feedback: submission.feedback,
        assignment: {
          _id: submission.assignmentId?._id,
          title: submission.assignmentId?.title,
          points: submission.assignmentId?.points || 100
        }
      }
    });
  } catch (error) {
    console.error('Error fetching student submission:', error);
    res.status(500).json({
      success: false,
    });
  }
};

exports.getAllSubmissions = async (req, res) => {
  try {
    const { assignmentId } = req.params;

    // First, get the assignment and populate class details to get all students
    const assignment = await Assignment.findById(assignmentId)
      .populate({
        path: 'classId',
        select: 'students',
        populate: {
          path: 'students',
          select: 'name email profilePicture'
        }
      });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    // Get all submissions for this assignment
    const submissions = await Submission.find({ assignmentId })
      .populate('studentId', 'name email profilePicture');

    // Create a map of submissions by student ID
    const submissionMap = submissions.reduce((acc, submission) => {
      acc[submission.studentId._id.toString()] = submission;
      return acc;
    }, {});

    // Create final array with all students and their submission status
    const allStudentSubmissions = assignment.classId.students.map(student => {
      const submission = submissionMap[student._id.toString()];
      return {
        student: {
          _id: student._id,
          name: student.name,
          email: student.email,
          profilePicture: student.profilePicture
        },
        submission: submission || null,
        status: submission ? submission.status : 'missing'
      };
    });

    res.status(200).json({
      success: true,
      submissions: allStudentSubmissions
    });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch submissions',
      error: error.message
    });
  }
};

exports.gradeSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { grade, feedback } = req.body;

    if (grade === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Grade is required'
      });
    }

    const submission = await Submission.findById(submissionId)
      .populate([
        { path: 'assignmentId', populate: { path: 'classId', select: 'className teacherId' } },
        { path: 'quizId', populate: { path: 'classId', select: 'className teacherId' } }
      ]);
      
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    // Update the submission
    submission.grade = grade;
    submission.feedback = feedback || '';
    submission.status = 'graded';
    await submission.save();

    // Send notification to student
    try {
      // Determine if this is an assignment or quiz submission
      const workType = submission.assignmentId ? 'assignment' : 'quiz';
      const workDoc = submission.assignmentId || submission.quizId;
      const classDoc = workDoc?.classId;
      
      if (workDoc && classDoc) {
        // Get teacher name
        const teacherId = typeof classDoc.teacherId === 'object' ? classDoc.teacherId : classDoc.teacherId;
        const teacher = await Teacher.findById(teacherId);
        const teacherName = teacher?.name || 'Teacher';
        
        const title = workDoc.title || (workType === 'assignment' ? 'Assignment' : 'Quiz');
        
        // Get points
        const points = workDoc.points || 100;
        
        await createGradeNotification(
          submission.studentId,
          classDoc._id,
          workType,
          title,
          teacherName,
          {
            workId: workDoc._id,
            grade,
            points,
            submissionId: submission._id
          }
        );
      }
    } catch (notificationError) {
      console.error('Error creating grade notification:', notificationError);
      // Don't fail the grading if notification fails
    }

    res.status(200).json({
      success: true,
      message: 'Submission graded successfully',
      submission
    });
  } catch (error) {
    console.error('Error grading submission:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to grade submission',
      error: error.message
    });
  }
};

exports.deleteSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const studentId = req.user._id;

    const submission = await Submission.findOne({ _id: submissionId, studentId });
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found or you do not have permission to delete it'
      });
    }

    // Delete files from S3
    if (submission.files && submission.files.length > 0) {
      for (const file of submission.files) {
        try {
          await deleteFile(file.key);
        } catch (error) {
          console.error('Error deleting file from S3:', error);
          // Continue with deletion even if S3 deletion fails
        }
      }
    }

    await Submission.findByIdAndDelete(submissionId);

    res.status(200).json({
      success: true,
      message: 'Submission deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting submission:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete submission',
      error: error.message
    });
  }
};

exports.unsubmitAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const studentId = req.user.id; // Ensure studentId is retrieved from auth

    console.log(`Unsubmitting assignment for student: ${studentId}, assignment: ${assignmentId}`);

    const submission = await Submission.findOne({ assignmentId, studentId });
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    // Delete files from S3 if they exist
    if (submission.files && submission.files.length > 0) {
      for (const file of submission.files) {
        try {
          await deleteFile(file.key);
        } catch (error) {
          console.error('Error deleting file from S3:', error);
        }
      }
    }

    // Remove the submission
    await Submission.findOneAndDelete({ assignmentId, studentId });

    res.status(200).json({
      success: true,
      message: 'Submission unsubmitted successfully'
    });
  } catch (error) {
    console.error('Error unsubmitting assignment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unsubmit assignment',
      error: error.message
    });
  }
};

exports.submitQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const studentId = req.user.id;

    // Get quiz to check due date
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    // Check if submission is late
    const now = new Date();
    const isLate = quiz.dueDate && now > new Date(quiz.dueDate);

    // First try to find existing submission
    const existingSubmission = await Submission.findOne({ 
      quizId, 
      studentId,
      assignmentId: null 
    });

    let submissionData = {
      quizId,
      studentId,
      assignmentId: null, // Explicitly set to null
      files: [],
      privateComment: req.body.privateComment || '',
      submittedAt: Date.now(),
      status: 'submitted',
      isLate: isLate
    };

    // Handle file uploads if present
    if (req.files && req.files.length > 0) {
      const newSubmissionFiles = await Promise.all(req.files.map(async (file) => {
        const key = `submissions/quiz/${quizId}/${studentId}/${Date.now()}-${file.originalname}`;
        const uploadResult = await uploadFile(file, key);
        return {
          fileName: file.originalname,
          fileType: file.mimetype,
          key: key,
          url: uploadResult.Location
        };
      }));
      submissionData.files = newSubmissionFiles;
    }

    let savedSubmission;
    if (existingSubmission) {
      // Update existing submission
      savedSubmission = await Submission.findOneAndUpdate(
        { _id: existingSubmission._id },
        submissionData,
        { new: true }
      );
    } else {
      // Create new submission
      savedSubmission = await Submission.create(submissionData);
    }

    res.status(200).json({
      success: true,
      message: 'Quiz submitted successfully',
      submission: savedSubmission
    });
  } catch (error) {
    console.error('Error submitting quiz:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit quiz',
      error: error.message
    });
  }
};

exports.getStudentQuizSubmission = async (req, res) => {
  try {
    const { quizId } = req.params;
    const studentId = req.user.id;

    // Populate quiz data to get points
    const submission = await Submission.findOne({ quizId, studentId })
      .populate('quizId', 'title points');

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'No submission found for this quiz'
      });
    }

    // Return the submission with quiz data for maximum points
    res.status(200).json({
      success: true,
      submission: {
        ...submission.toObject(),
        quiz: {
          _id: submission.quizId?._id,
          title: submission.quizId?.title,
          points: submission.quizId?.points || 100
        }
      }
    });
  } catch (error) {
    console.error('Error fetching quiz submission:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quiz submission',
      error: error.message
    });
  }
};

exports.unsubmitQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const studentId = req.user.id;

    const submission = await Submission.findOne({ quizId, studentId });
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    if (submission.files && submission.files.length > 0) {
      for (const file of submission.files) {
        await deleteFile(file.key);
      }
    }

    await Submission.findOneAndDelete({ quizId, studentId });

    res.status(200).json({
      success: true,
      message: 'Quiz unsubmitted successfully'
    });
  } catch (error) {
    console.error('Error unsubmitting quiz:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unsubmit quiz',
      error: error.message
    });
  }
};

exports.addOrUpdateQuizPrivateComment = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { privateComment } = req.body;
    const studentId = req.user.id;

    console.log(`Adding private comment for quiz: ${quizId}, student: ${studentId}`);
    
    if (!privateComment && privateComment !== '') {
      return res.status(400).json({
        success: false,
        message: 'Private comment is required'
      });
    }

    // Find existing submission or create a new one
    let submission = await Submission.findOne({ quizId, studentId });
    
    if (submission) {
      console.log(`Updating private comment for existing submission: ${submission._id}`);
      submission.privateComment = privateComment;
      await submission.save();
    } else {
      console.log('Creating new submission with only private comment');
      submission = new Submission({
        quizId,
        studentId,
        privateComment,
        files: [],
        status: 'submitted'
      });
      await submission.save();
    }

    console.log('Private comment saved successfully');
    
    res.status(200).json({
      success: true,
      message: 'Private comment updated successfully',
      submission
    });
  } catch (error) {
    console.error('Error updating private comment for quiz:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update private comment',
      error: error.message
    });
  }
};

exports.getAllQuizSubmissions = async (req, res) => {
  try {
    const { quizId } = req.params;

    const quiz = await Quiz.findById(quizId).populate({
      path: 'classId',
      select: 'students',
      populate: {
        path: 'students',
        select: 'name email profilePicture'
      }
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    const submissions = await Submission.find({ quizId })
      .populate('studentId', 'name email profilePicture');

    const submissionMap = submissions.reduce((acc, submission) => {
      acc[submission.studentId._id.toString()] = submission;
      return acc;
    }, {});

    const allStudentSubmissions = quiz.classId.students.map(student => {
      const submission = submissionMap[student._id.toString()];
      return {
        student: {
          _id: student._id,
          name: student.name,
          email: student.email,
          profilePicture: student.profilePicture
        },
        submission: submission || null,
        status: submission ? submission.status : 'missing'
      };
    });

    res.status(200).json({
      success: true,
      submissions: allStudentSubmissions
    });
  } catch (error) {
    console.error('Error fetching quiz submissions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quiz submissions',
      error: error.message
    });
  }
};
