const Quiz = require('../models/Quiz');
const { uploadFile } = require('../utils/s3Service');
const Class = require('../models/Class');
const { createClassworkNotifications } = require('../utils/notificationHelper');

exports.getQuizzes = async (req, res) => {
  try {
    const { classId } = req.params;
    const quizzes = await Quiz.find({ classId }).sort({ createdAt: -1 });
    console.log('Fetched quizzes:', quizzes); // Log quizzes from the database
    res.status(200).json({ success: true, quizzes });
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch quizzes', error: error.message });
  }
};

exports.getQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const quiz = await Quiz.findById(id);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }
    res.status(200).json({ success: true, quiz });
  } catch (error) {
    console.error('Error fetching quiz:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch quiz', error: error.message });
  }
};

exports.createQuiz = async (req, res) => {
  try {
    const { classId } = req.params;
    const { title, instructions, points, dueDate, createdBy, questions, category } = req.body;

    if (!title || !classId || !createdBy) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Create attachment array from uploaded files
    let attachments = [];
    if (req.files && req.files.length > 0) {
      try {
        for (const file of req.files) {
          const key = `quizzes/${classId}/${Date.now()}-${file.originalname}`;
          const uploadResult = await uploadFile(file, key);

          attachments.push({
            fileName: file.originalname,
            fileType: file.mimetype,
            key: key,
            url: uploadResult.Location
          });
        }
      } catch (error) {
        console.error('Error uploading files:', error);
        // Continue without attachments if upload fails
      }
    }

    const quiz = new Quiz({
      title,
      instructions: instructions || '',
      classId,
      points: Number(points) || 0,
      dueDate: dueDate || null,
      createdBy,
      questions: questions || [],
      category: category || 'general',
      attachments
    });

    const savedQuiz = await quiz.save();

    // Create notifications for students
    try {
      // Get teacher name for notification
      const classWithTeacher = await Class.findById(classId).populate('teacherId', 'name');
      const teacherName = classWithTeacher?.teacherId?.name || 'Teacher';
      
      await createClassworkNotifications(
        classId, 
        'quiz', 
        title, 
        teacherName,
        {
          workId: savedQuiz._id,
          dueDate: dueDate,
          points: points
        }
      );
    } catch (notificationError) {
      console.error('Error creating quiz notifications:', notificationError);
      // Don't fail the quiz creation if notifications fail
    }

    res.status(201).json({
      success: true,
      message: 'Quiz created successfully',
      quiz: savedQuiz
    });
  } catch (error) {
    console.error('Error creating quiz:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create quiz',
      error: error.message
    });
  }
};

exports.updateQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedQuiz = await Quiz.findByIdAndUpdate(id, req.body, { new: true });
    res.status(200).json({ success: true, message: 'Quiz updated successfully', quiz: updatedQuiz });
  } catch (error) {
    console.error('Error updating quiz:', error);
    res.status(500).json({ success: false, message: 'Failed to update quiz', error: error.message });
  }
};

exports.deleteQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    await Quiz.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: 'Quiz deleted successfully' });
  } catch (error) {
    console.error('Error deleting quiz:', error);
    res.status(500).json({ success: false, message: 'Failed to delete quiz', error: error.message });
  }
};
