const Material = require('../models/Material');
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
