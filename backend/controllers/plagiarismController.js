const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const PlagiarismReport = require('../models/PlagiarismReport');
const plagiarismService = require('../services/plagiarismService');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs-extra');

const checkPlagiarism = async (req, res) => {
  try {
    console.log('[Plagiarism] checkPlagiarism called');
    const { assignmentId } = req.params;
    const teacherId = req.user.id;
    console.log(`[Plagiarism] assignmentId: ${assignmentId}, teacherId: ${teacherId}`);

    const assignment = await Assignment.findById(assignmentId).populate({
      path: 'classId',
      populate: {
        path: 'teacherId',
        select: '_id',
      },
    });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found',
      });
    }

    if (assignment.classId.teacherId._id.toString() !== teacherId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to check plagiarism for this assignment',
      });
    }

    const submissions = await Submission.find({ assignmentId }).populate('studentId', 'name email _id');

    if (submissions.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Need at least 2 submissions to check for plagiarism',
      });
    }

    const language = assignment.programmingLanguage || 'java';
    const result = await plagiarismService.checkPlagiarism(submissions, assignmentId, language);

    const report = new PlagiarismReport({
      assignmentId,
      reportId: result.codequiry.check_id, // Save check ID as reportId
      reportUrl: result.codequiry.overview?.overviewURL, // Save overview URL
      checkId: result.codequiry.check_id,
      overview: result.codequiry.overview,
      createdBy: teacherId,
      type: 'codequiry',
    });

    await report.save();

    res.status(200).json({
      success: true,
      message: 'Plagiarism check completed',
      report: {
        checkId: report.checkId,
        reportId: report.reportId,
        reportUrl: report.reportUrl,
        overview: report.overview,
        createdAt: report.createdAt,
      },
    });
  } catch (error) {
    console.error('Error in checkPlagiarism:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to check plagiarism',
    });
  }
};

const getPlagiarismResults = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const report = await PlagiarismReport.findOne({
      assignmentId,
      type: 'codequiry',
    }).sort({ createdAt: -1 });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'No plagiarism report found for this assignment',
      });
    }

    res.status(200).json({
      success: true,
      report: {
        checkId: report.checkId,
        reportId: report.reportId,
        reportUrl: report.reportUrl,
        overview: report.overview,
        createdAt: report.createdAt,
      },
    });
  } catch (error) {
    console.error('Error in getPlagiarismResults:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get plagiarism results',
    });
  }
};

const getPlagiarismHistory = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const reports = await PlagiarismReport.find({
      assignmentId,
      type: 'codequiry',
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      reports: reports.map((report) => ({
        checkId: report.checkId,
        reportId: report.reportId,
        reportUrl: report.reportUrl,
        overview: report.overview,
        createdAt: report.createdAt,
      })),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get plagiarism history',
    });
  }
};

const deletePlagiarismResults = async (req, res) => {
  try {
    const { reportId } = req.params;
    await PlagiarismReport.findByIdAndDelete(reportId);
    res.status(200).json({
      success: true,
      message: 'Plagiarism report deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete plagiarism results',
    });
  }
};

module.exports = {
  checkPlagiarism,
  getPlagiarismResults,
  getPlagiarismHistory,
  deletePlagiarismResults,
};
