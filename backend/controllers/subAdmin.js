const Institute = require('../models/InstituteRequest');
const bcrypt = require('bcrypt');

exports.registerInstitute = async (req, res) => {

    const { instituteName, numberOfStudents, region, instituteAdminName, instituteAdminEmail, institutePhoneNumber, domainName, username, password } = req.body;

    if (!instituteName || typeof instituteName !== 'string') {
        return res.status(400).json({ error: 'Invalid instituteName' });
    }
    if (!numberOfStudents || typeof numberOfStudents !== 'string') {
        return res.status(400).json({ error: 'Invalid numberOfStudents' });
    }
    if (!region || typeof region !== 'string') {
        return res.status(400).json({ error: 'Invalid region' });
    }
    if (!instituteAdminName || typeof instituteAdminName !== 'string') {
        return res.status(400).json({ error: 'Invalid instituteAdminName' });
    }
    if (!instituteAdminEmail || typeof instituteAdminEmail !== 'string' || !instituteAdminEmail.includes('@')) {
        return res.status(400).json({ error: 'Invalid instituteAdminEmail' });
    }
    if (!institutePhoneNumber || typeof institutePhoneNumber !== 'string') {
        return res.status(400).json({ error: 'Invalid institutePhoneNumber' });
    }
    if (!domainName || typeof domainName !== 'string') {
        return res.status(400).json({ error: 'Invalid domainName' });
    }
    if (!username || typeof username !== 'string') {
        return res.status(400).json({ error: 'Invalid username' });
    }
    if (!password || typeof password !== 'string') {
        return res.status(400).json({ error: 'Invalid password' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const newInstitute = new Institute({
            instituteName,
            numberOfStudents,
            region,
            instituteAdminName,
            instituteAdminEmail,
            institutePhoneNumber,
            domainName,
            username,
            password: hashedPassword
        });
        console.log('New institute:', newInstitute);

        await newInstitute.save();
        res.status(201).json({ message: 'Registration request processed!' });
    } catch (err) {
        console.error('Error during institute registration:', err);
        res.status(500).json({ error: err.message });
    }
};
