const Material = require('../models/Material');
const Class = require('../models/Class'); // Add this import
const { uploadFile, deleteFile } = require('../utils/s3Service');

exports.createMaterial = async (req, res) => {
  try {
    const { classId } = req.params;
    const { title, description, topicId } = req.body; // Ensure description is extracted
    const createdBy = req.user.id;
    console.log("Material des : " + description);

    let attachments = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const key = `materials/${classId}/${Date.now()}-${file.originalname}`;
        const uploadResult = await uploadFile(file, key);
        attachments.push({
          fileName: file.originalname,
          fileType: file.mimetype,
          key: key,
          url: uploadResult.Location
        });
      }
    }

    const material = new Material({
      title,
      description, // Save description in the database
      classId,
      topicId: topicId || null,
      createdBy,
      attachments,
      type: 'material' // Ensure type is set to material
    });

    const savedMaterial = await material.save();

    // Update class to include the new material
    await Class.findByIdAndUpdate(
      classId,
      { $push: { materials: savedMaterial._id } },
      { new: true }
    );

    res.status(201).json({
      success: true,
      message: 'Material created successfully',
      material: savedMaterial
    });
  } catch (error) {
    console.error('Error creating material:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create material',
      error: error.message
    });
  }
};

exports.getMaterials = async (req, res) => {
  try {
    const { classId } = req.params;
    const materials = await Material.find({ classId })
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      materials
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch materials',
      error: error.message
    });
  }
};

exports.getMaterial = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id)
      .populate('createdBy', 'name')
      .populate('topicId', 'name');

    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Material not found'
      });
    }

    res.status(200).json({
      success: true,
      material
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch material',
      error: error.message
    });
  }
};

exports.deleteMaterial = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);
    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Material not found'
      });
    }

    // Delete attachments from S3
    if (material.attachments?.length > 0) {
      for (const attachment of material.attachments) {
        try {
          await deleteFile(attachment.key);
        } catch (error) {
          console.error('Error deleting file from S3:', error);
        }
      }
    }

    await Material.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Material deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting material:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete material',
      error: error.message
    });
  }
};

exports.addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { text, userName } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        message: 'Comment text is required'
      });
    }

    const material = await Material.findById(id);
    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Material not found'
      });
    }

    // Determine if the user is a teacher or student
    const isTeacher = req.user.role === 'teacher';
    const authorModel = isTeacher ? 'Teacher' : 'Student';
    const authorRole = isTeacher ? 'Teacher' : 'Student';
    
    // Use name from request body or req.user, with a fallback
    const authorName = userName || req.user.name || (isTeacher ? 'Teacher' : 'Student');
    
    console.log('Creating comment with author name:', authorName);
    
    const comment = {
      text,
      author: req.user.id,
      authorModel,
      authorName,
      authorRole
    };

    material.comments.push(comment);
    await material.save();

    res.status(200).json({
      success: true,
      message: 'Comment added successfully',
      comment: material.comments[material.comments.length - 1]
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add comment',
      error: error.message
    });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const { id, commentId } = req.params;
    const { id: userId, role } = req.user; // Get user ID and role

    const material = await Material.findById(id);
    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Material not found'
      });
    }

    // Find the comment
    const commentIndex = material.comments.findIndex(
      comment => comment._id.toString() === commentId
    );

    if (commentIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    const comment = material.comments[commentIndex];

    // Allow teachers to delete any comment OR allow users to delete their own comments
    if (role === 'teacher' || comment.author.toString() === userId) {
      // Remove the comment
      material.comments.splice(commentIndex, 1);
      await material.save();

      return res.status(200).json({
        success: true,
        message: 'Comment deleted successfully'
      });
    }

    return res.status(403).json({
      success: false,
      message: 'You are not authorized to delete this comment'
    });
    
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete comment',
      error: error.message
    });
  }
};
