const RegisteredInstitute = require('../models/approveInstitute');

/**
 * Extracts domain from email and validates if institute exists
 * @param {string} email - User email address
 * @returns {Object} Object containing instituteId and institute document
 */
exports.validateDomain = async (email) => {
    const domain = email.split('@')[1];
    if (!domain) {
        throw new Error('Invalid email format');
    }
    
    const institute = await RegisteredInstitute.findOne({ domainName: domain });
    if (!institute) {
        throw new Error('Invalid domain. Institute not found.');
    }
    
    return { 
        instituteId: institute._id, 
        institute,
        domain
    };
};

/**
 * Finds a user (student or teacher) by email using domain lookup
 * @param {string} email - User email address
 * @param {Object} Model - Mongoose model (Student or Teacher)
 * @returns {Object} Object containing user document and institute document
 */
exports.findUserByEmailDomain = async (email, Model) => {
    const { instituteId, institute } = await this.validateDomain(email);
    
    const user = await Model.findOne({ 
        email: email,
        instituteId: instituteId
    });
    
    return { user, institute };
};

/**
 * Gets an institute by domain name
 * @param {string} domainName - Institute domain name
 * @returns {Object} Institute document
 */
exports.getInstituteByDomain = async (domainName) => {
    const institute = await RegisteredInstitute.findOne({ domainName });
    if (!institute) {
        throw new Error('Institute not found for domain: ' + domainName);
    }
    return institute;
};

/**
 * Adds a class to an institute's classes array
 * @param {string} instituteId - Institute ID
 * @param {string} classId - Class ID to add
 */
exports.addClassToInstitute = async (instituteId, classId) => {
    await RegisteredInstitute.findByIdAndUpdate(
        instituteId,
        { $addToSet: { classes: classId } }
    );
};
