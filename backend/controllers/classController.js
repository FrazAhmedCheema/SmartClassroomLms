const Class = require('../models/Class');

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
