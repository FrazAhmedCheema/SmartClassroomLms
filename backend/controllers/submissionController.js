const Submission = require('../models/Submission');
const Assignment = require('../models/Assignment');
const { uploadFile, deleteFile } = require('../utils/s3Service');

exports.submitAssignment = async (req, res) => {
  try {
    console.log('Submission request received:', {
      params: req.params,
      body: req.body,
      files: req.files?.length || 0,
      user: req.user
    });

    const { assignmentId } = req.params;
    const { privateComment } = req.body;
    const studentId = req.user.id; // Get studentId from authenticated user

    console.log('Student ID from auth:', studentId);

    // Verify studentId exists
    if (!studentId) {
      return res.status(401).json({
        success: false,
        message: 'Student ID not found. Please log in again.'
      });
    }

    // Check if assignment exists
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      console.error(`Assignment not found with ID: ${assignmentId}`);
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    console.log(`Found assignment: ${assignment.title}`);

    // Create submission attachments array from uploaded files
    let submissionFiles = [];
    if (req.files && req.files.length > 0) {
      console.log(`Processing ${req.files.length} uploaded files`);
      try {
        for (const file of req.files) {
          const key = `submissions/${assignmentId}/${studentId}/${Date.now()}-${file.originalname}`;
          const uploadResult = await uploadFile(file, key);
          
          submissionFiles.push({
            fileName: file.originalname,
            fileType: file.mimetype,
            key: key,
            url: uploadResult.Location
          });
        }
      } catch (error) {
        console.error('Error uploading submission files:', error);
        return res.status(500).json({
          success: false,
          message: 'Error uploading files',
          error: error.message
        });
      }
    }

    // Create or update submission
    const submissionData = {
      assignmentId,
      studentId, // Use the studentId from auth
      files: submissionFiles,
      privateComment: privateComment || '',
      submittedAt: Date.now(),
      status: 'submitted'
    };

    console.log('Creating or updating submission with data:', submissionData);

    const savedSubmission = await Submission.findOneAndUpdate(
      { assignmentId, studentId },
      submissionData,
      { new: true, upsert: true }
    );

    // Push submission ID to the assignment's studentSubmissions array
    if (!assignment.studentSubmissions.includes(savedSubmission._id)) {
      assignment.studentSubmissions.push(savedSubmission._id);
      await assignment.save();
    }

    console.log(`Submission saved successfully with ID: ${savedSubmission._id}`);
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
    const studentId = req.user._id;

    console.log('Fetching submission:', { assignmentId, studentId });

    const submission = await Submission.findOne({ 
      assignmentId, 
      studentId 
    });

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
        status: submission.status
      }
    });
  } catch (error) {
    console.error('Error fetching student submission:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching submission',
      error: error.message
    });
  }
};

exports.getAllSubmissions = async (req, res) => {
  try {
    const { assignmentId } = req.params;

    // Check if the assignment exists
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    // Get all submissions for this assignment
    const submissions = await Submission.find({ assignmentId })
      .populate('studentId', 'name email profilePicture') // Populate student info
      .sort({ submittedAt: -1 });

    res.status(200).json({
      success: true,
      submissions
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

    const submission = await Submission.findById(submissionId);
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
    const studentId = req.user._id;

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
