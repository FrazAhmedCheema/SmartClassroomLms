const Question = require('../models/Question');
const { uploadFile, deleteFile } = require('../utils/s3Service');
const Class = require('../models/Class'); // Import Class model
const { createClassworkNotifications } = require('../utils/notificationHelper');

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

    // Update class to include the new question
    await Class.findByIdAndUpdate(
      classId,
      { $push: { questions: savedQuestion._id } },
      { new: true }
    );

    // Create notifications for students
    try {
      // Get teacher name for notification
      const classWithTeacher = await Class.findById(classId).populate('teacherId', 'name');
      const teacherName = classWithTeacher?.teacherId?.name || 'Teacher';
      
      await createClassworkNotifications(
        classId, 
        'question', 
        title, 
        teacherName,
        {
          workId: savedQuestion._id,
          dueDate: dueDate,
          points: points
        }
      );
    } catch (notificationError) {
      console.error('Error creating question notifications:', notificationError);
      // Don't fail the question creation if notifications fail
    }

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
        submittedAnswer: existingAnswer.answer,
        submissionTime: existingAnswer.submittedAt
      });
    }

    // Add new answer
    const newAnswer = {
      studentId,
      studentName: studentName || req.user.name || 'Anonymous Student',
      answer
    };
    
    question.answers.push(newAnswer);

    // For poll questions, also update poll responses and calculate results
    if (question.questionType === 'poll') {
      // Add to poll responses
      question.pollResponses.push({
        studentId,
        response: answer
      });
      
      // Update totalVotes
      question.totalVotes = question.pollResponses.length;
      
      // Calculate updated results
      const voteCounts = {};
      question.options.forEach((_, index) => {
        voteCounts[index] = 0;
      });
      
      // Count votes for each option
      question.pollResponses.forEach(response => {
        const optionIndex = Number(response.response);
        if (voteCounts[optionIndex] !== undefined) {
          voteCounts[optionIndex]++;
        }
      });

      // Calculate percentages
      question.results = Object.keys(voteCounts).map(optionIndex => {
        const votes = voteCounts[optionIndex];
        return {
          optionIndex: Number(optionIndex),
          votes: votes,
          percentage: (votes / question.totalVotes) * 100 || 0
        };
      });
    }

    await question.save();

    res.status(200).json({
      success: true,
      message: 'Answer submitted successfully',
      answer: newAnswer
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

    // If the user is a student, make sure we return only their answer
    if (req.user.role === 'student') {
      const studentAnswers = question.answers.filter(a => 
        a.studentId._id.toString() === req.user.id
      );
      
      return res.status(200).json({
        success: true,
        answers: studentAnswers,
        hasSubmitted: studentAnswers.length > 0
      });
    }

    // For teachers, return all answers
    res.status(200).json({
      success: true,
      answers: question.answers,
      totalAnswers: question.answers.length
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
    const question = await Question.findById(id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    // If results are already calculated, return them
    if (question.results && question.results.length > 0) {
      return res.status(200).json({
        success: true,
        results: question.results,
        totalVotes: question.totalVotes || question.pollResponses.length
      });
    }

    // Otherwise, calculate results on the fly
    const totalVotes = question.pollResponses.length;
    
    // Create an array of results
    const results = question.options.map((option, index) => {
      const votes = question.pollResponses.filter(
        vote => Number(vote.response) === index
      ).length;

      return {
        optionIndex: index,
        option,
        votes,
        percentage: (votes / totalVotes) * 100 || 0
      };
    });

    // Save results for future use
    question.results = results;
    question.totalVotes = totalVotes;
    await question.save();

    res.status(200).json({
      success: true,
      results,
      totalVotes
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
