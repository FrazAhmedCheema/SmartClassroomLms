const Discussion = require('../models/Discussion');
const Class = require('../models/Class');
const Teacher = require('../models/teacher');
const Student = require('../models/student');
const mongoose = require('mongoose');

exports.getDiscussions = async (req, res) => {
  try {
    const { classId } = req.params;
    console.log('Fetching discussions for class:', classId);

    const classDoc = await Class.findById(classId);
    if (!classDoc) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }

    // First fetch discussions without population
    let discussions = await Discussion.find({ classId });

    // Then populate each discussion manually
    const populatedDiscussions = await Promise.all(discussions.map(async (discussion) => {
      // Populate main author
      const authorModel = mongoose.model(discussion.authorModel);
      const author = await authorModel.findById(discussion.author).select('name');
      discussion.author = author;

      // Populate message authors
      for (let message of discussion.messages) {
        const messageAuthorModel = mongoose.model(message.authorModel);
        const messageAuthor = await messageAuthorModel.findById(message.author).select('name');
        message.author = messageAuthor;
      }

      return discussion;
    }));

    // Sort by last activity
    populatedDiscussions.sort((a, b) => b.lastActivity - a.lastActivity);

    res.json({ 
      success: true, 
      discussions: populatedDiscussions
    });
  } catch (error) {
    console.error('Discussion fetch error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

exports.createDiscussion = async (req, res) => {
  try {
    const { classId, title, message, authorModel } = req.body;
    const userId = req.user.id;

    // Create the discussion
    const discussion = new Discussion({
      classId,
      title,
      author: userId,
      authorModel,
      messages: [{
        content: message,
        author: userId,
        authorModel
      }]
    });

    // Save the discussion
    const savedDiscussion = await discussion.save();

    // Update the class with the new discussion ID
    await Class.findByIdAndUpdate(
      classId,
      { 
        $push: { discussions: savedDiscussion._id } 
      },
      { new: true }
    );

    // Populate author details before sending response
    const populatedDiscussion = await Discussion.findById(savedDiscussion._id)
      .populate('author', 'name email')
      .populate('messages.author', 'name email');

    res.status(201).json({
      success: true,
      discussion: populatedDiscussion
    });

  } catch (error) {
    console.error('Create discussion error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.addMessage = async (req, res) => {
  try {
    const { discussionId } = req.params;
    const { content, replyTo } = req.body;
    const authorModel = req.user.role === 'teacher' ? 'Teacher' : 'Student';

    let discussion = await Discussion.findById(discussionId);
    if (!discussion) {
      return res.status(404).json({ success: false, message: 'Discussion not found' });
    }

    // Add new message
    const newMessage = {
      content,
      author: req.user.id,
      authorModel,
      replyTo: replyTo || null
    };

    discussion.messages.push(newMessage);
    discussion.lastActivity = Date.now();
    
    await discussion.save();

    // Populate the new message's author
    const addedMessage = discussion.messages[discussion.messages.length - 1];
    const MessageAuthorModel = mongoose.model(authorModel);
    const populatedAuthor = await MessageAuthorModel.findById(req.user.id).select('name');
    
    // Manually populate the author
    addedMessage.author = populatedAuthor;

    res.status(200).json({ 
      success: true, 
      message: addedMessage
    });

  } catch (error) {
    console.error('Add message error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to add message',
      error: error.message 
    });
  }
};

exports.deleteMessage = async (req, res) => {
  try {
    const { discussionId, messageId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const discussion = await Discussion.findById(discussionId);
    if (!discussion) {
      return res.status(404).json({ 
        success: false, 
        message: 'Discussion not found' 
      });
    }

    const messageIndex = discussion.messages.findIndex(
      msg => msg._id.toString() === messageId
    );

    if (messageIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        message: 'Message not found' 
      });
    }

    const message = discussion.messages[messageIndex];

    // Allow teachers to delete any message, but students can only delete their own
    if (userRole !== 'teacher' && message.author.toString() !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to delete this message' 
      });
    }

    // Remove message
    discussion.messages.splice(messageIndex, 1);
    
    // Update lastActivity if this was the last message
    if (discussion.messages.length > 0) {
      discussion.lastActivity = discussion.messages[discussion.messages.length - 1].createdAt;
    }

    await discussion.save();

    res.json({ 
      success: true, 
      message: 'Message deleted successfully',
      discussionId,
      messageId
    });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to delete message'
    });
  }
};

exports.terminateDiscussion = async (req, res) => {
  try {
    const { discussionId } = req.params;

    console.log('Terminating discussion:', discussionId);
    console.log('User making the request:', req.user);

    const discussion = await Discussion.findById(discussionId);
    if (!discussion) {
      return res.status(404).json({ success: false, message: 'Discussion not found' });
    }

    // Only allow teachers to terminate discussions
    if (req.user.role !== 'teacher') {
      console.warn('Unauthorized attempt to terminate discussion by:', req.user);
      return res.status(403).json({ success: false, message: 'Not authorized to terminate this discussion' });
    }

    discussion.terminated = true;
    await discussion.save();

    res.status(200).json({ success: true, message: 'Discussion terminated successfully' });
  } catch (error) {
    console.error('Error terminating discussion:', error);
    res.status(500).json({ success: false, message: 'Failed to terminate discussion', error: error.message });
  }
};
