const Topic = require('../models/Topic');
const Class = require('../models/Class');

// Create a new topic
exports.createTopic = async (req, res) => {
  try {
    const { classId } = req.params;
    const { name, category } = req.body;

    // Check if required fields are provided
    if (!name || !category) {
      return res.status(400).json({
        success: false,
        message: 'Name and category are required'
      });
    }

    // Validate category
    const validCategories = ['assignment', 'quiz', 'question', 'material'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category. Must be one of: assignment, quiz, question, material'
      });
    }

    // Check if class exists
    const classExists = await Class.findById(classId);
    if (!classExists) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }

    // Check if topic with the same name already exists
    const existingTopic = await Topic.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') }, // Case insensitive search
      classId 
    });

    if (existingTopic) {
      return res.status(400).json({
        success: false,
        message: 'A topic with this name already exists in this class'
      });
    }

    // Create new topic
    const topic = new Topic({
      name,
      category,
      classId
    });

    await topic.save();

    return res.status(201).json({
      success: true,
      topic
    });
  } catch (error) {
    console.error('Error creating topic:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create topic',
      error: error.message
    });
  }
};

// Get all topics for a class
exports.getTopics = async (req, res) => {
  const { classId } = req.params;

  if (!classId) {
    return res.status(400).json({
      success: false,
      message: 'Class ID is required'
    });
  }

  try {
    const topics = await Topic.find({ classId })
      .populate('classId', 'name') // Populate classId if needed
      // .populate('createdBy', 'name email') // Remove this line if createdBy is not required
      .exec();

    res.status(200).json({
      success: true,
      topics
    });
  } catch (error) {
    console.error('Error getting topics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get topics',
      error: error.message
    });
  }
};

// Update a topic
exports.updateTopic = async (req, res) => {
  try {
    const { topicId } = req.params;
    const { name, category } = req.body;
    const userId = req.user._id; // From auth middleware

    // Check if topic exists
    const topic = await Topic.findById(topicId);
    if (!topic) {
      return res.status(404).json({
        success: false,
        message: 'Topic not found'
      });
    }

    // Validate category if provided
    if (category) {
      const validCategories = ['assignment', 'quiz', 'question', 'material'];
      if (!validCategories.includes(category)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid category. Must be one of: assignment, quiz, question, material'
        });
      }
    }

    // Check if another topic with the same name exists in this class
    if (name && name !== topic.name) {
      const existingTopic = await Topic.findOne({ 
        name: { $regex: new RegExp(`^${name}$`, 'i') }, // Case insensitive search
        classId: topic.classId,
        _id: { $ne: topicId } // Exclude current topic
      });

      if (existingTopic) {
        return res.status(400).json({
          success: false,
          message: 'Another topic with this name already exists in this class'
        });
      }
    }

    // Update topic
    if (name) topic.name = name;
    if (category) topic.category = category;
    topic.updatedAt = Date.now();

    await topic.save();

    return res.status(200).json({
      success: true,
      topic
    });
  } catch (error) {
    console.error('Error updating topic:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update topic',
      error: error.message
    });
  }
};

// Delete a topic
exports.deleteTopic = async (req, res) => {
  try {
    const { topicId } = req.params;
    const userId = req.user._id; // From auth middleware

    // Check if topic exists
    const topic = await Topic.findById(topicId);
    if (!topic) {
      return res.status(404).json({
        success: false,
        message: 'Topic not found'
      });
    }

    // Delete topic
    await Topic.findByIdAndDelete(topicId);

    return res.status(200).json({
      success: true,
      message: 'Topic deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting topic:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete topic',
      error: error.message
    });
  }
};
