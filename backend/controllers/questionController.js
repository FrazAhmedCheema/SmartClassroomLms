const Question = require('../models/Question');
const { uploadFile, deleteFile } = require('../utils/s3Service');

exports.createQuestion = async (req, res) => {
  try {
    const { classId } = req.params;
    const { 
      title, 
      description, 
      questionText, 
      questionType, 
      options, 
      correctAnswer, 
      allowMultipleAnswers, 
      points, 
      topicId, 
      dueDate 
    } = req.body;
    const createdBy = req.user.id;
    
    console.log("Question data:", { 
      title, description, questionText, questionType, options, correctAnswer 
    });

    // Handle options array from form data
    let parsedOptions = [];
    if (options) {
      if (Array.isArray(options)) {
        parsedOptions = options;
      } else if (typeof options === 'string') {
        try {
          parsedOptions = JSON.parse(options);
        } catch (e) {
          parsedOptions = [options];
        }
      }
    }

    // Process file uploads
    let attachments = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const key = `questions/${classId}/${Date.now()}-${file.originalname}`;
        const uploadResult = await uploadFile(file, key);
        attachments.push({
          fileName: file.originalname,
          fileType: file.mimetype,
          key: key,
          url: uploadResult.Location
        });
      }
    }

    const question = new Question({
      title,
      description,
      questionText,
      questionType: questionType || 'short_answer',
      options: parsedOptions,
      correctAnswer,
      allowMultipleAnswers: allowMultipleAnswers === 'true',
      points: Number(points) || 0,
      classId,
      topicId: topicId || null,
      createdBy,
      attachments,
      dueDate: dueDate || null,
      type: 'question'
    });

    const savedQuestion = await question.save();

    res.status(201).json({
      success: true,
      message: 'Question created successfully',
      question: savedQuestion
    });
  } catch (error) {
    console.error('Error creating question:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create question',
      error: error.message
    });
  }
};

exports.getQuestions = async (req, res) => {
  try {
    const { classId } = req.params;
    const questions = await Question.find({ classId })
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      questions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch questions',
      error: error.message
    });
  }
};

exports.getQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id)
      .populate('createdBy', 'name')
      .populate('topicId', 'name');

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    res.status(200).json({
      success: true,
      question
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch question',
      error: error.message
    });
  }
};

exports.deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    // Delete attachments from S3
    if (question.attachments?.length > 0) {
      for (const attachment of question.attachments) {
        try {
          await deleteFile(attachment.key);
        } catch (error) {
          console.error('Error deleting file from S3:', error);
        }
      }
    }

    await Question.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Question deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting question:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete question',
      error: error.message
    });
  }
};

exports.submitAnswer = async (req, res) => {
  try {
    const { id } = req.params;
    const { answer, studentName } = req.body;
    const studentId = req.user.id;

    // Validation
    if (!answer) {
      return res.status(400).json({
        success: false,
        message: 'Answer is required'
      });
    }

    const question = await Question.findById(id);
    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    // Check if student has already submitted an answer
    const existingAnswer = question.answers.find(a => 
      a.studentId.toString() === studentId.toString()
    );

    if (existingAnswer) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted an answer to this question',
        submittedAnswer: existingAnswer.answer
      });
    }

    // Add new answer
    question.answers.push({
      studentId,
      studentName: studentName || req.user.name || 'Anonymous Student',
      answer
    });

    await question.save();

    res.status(200).json({
      success: true,
      message: 'Answer submitted successfully'
    });
  } catch (error) {
    console.error('Error submitting answer:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit answer',
      error: error.message
    });
  }
};

exports.getAnswers = async (req, res) => {
  try {
    const { id } = req.params;
    const question = await Question.findById(id)
      .populate('answers.studentId', 'name');

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    res.status(200).json({
      success: true,
      answers: question.answers
    });
  } catch (error) {
    console.error('Error fetching answers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch answers',
      error: error.message
    });
  }
};

exports.submitPollVote = async (req, res) => {
  try {
    const { id } = req.params;
    const { response } = req.body;
    const studentId = req.user.id;

    const question = await Question.findById(id);
    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    // Remove any existing vote from this student
    question.pollResponses = question.pollResponses.filter(
      vote => vote.studentId.toString() !== studentId.toString()
    );

    // Add new vote
    question.pollResponses.push({
      studentId,
      response
    });

    await question.save();

    res.status(200).json({
      success: true,
      message: 'Vote submitted successfully'
    });
  } catch (error) {
    console.error('Error submitting vote:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit vote',
      error: error.message
    });
  }
};

exports.getPollResults = async (req, res) => {
  try {
    const { id } = req.params;
    const question = await Question.findById(id)
      .populate('pollResponses.studentId', 'name');

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    // Calculate poll results
    const results = question.options.map((option, index) => {
      const votes = question.pollResponses.filter(
        vote => vote.response === index.toString()
      ).length;

      return {
        option,
        votes,
        percentage: (votes / question.pollResponses.length) * 100 || 0
      };
    });

    res.status(200).json({
      success: true,
      results,
      totalVotes: question.pollResponses.length
    });
  } catch (error) {
    console.error('Error fetching poll results:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch poll results',
      error: error.message
    });
  }
};
