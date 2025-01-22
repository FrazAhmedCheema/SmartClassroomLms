const Institute = require('../models/InstituteRequest');

exports.registerInstitute = async (req, res) => {

    const { instituteName, numberOfStudents, region, name, email, institutePhoneNumber, domainName } = req.body;

    if (!instituteName || typeof instituteName !== 'string') {
        return res.status(400).json({ error: 'Invalid instituteName' });
    }
    if (!numberOfStudents || typeof numberOfStudents !== 'string') {
        return res.status(400).json({ error: 'Invalid numberOfStudents' });
    }
    if (!region || typeof region !== 'string') {
        return res.status(400).json({ error: 'Invalid region' });
    }
    if (!name || typeof name !== 'string') {
        return res.status(400).json({ error: 'Invalid name' });
    }
    if (!email || typeof email !== 'string' || !email.includes('@')) {
        return res.status(400).json({ error: 'Invalid email' });
    }
    if (!institutePhoneNumber || typeof institutePhoneNumber !== 'string') {
        return res.status(400).json({ error: 'Invalid institutePhoneNumber' });
    }
    if (!domainName || typeof domainName !== 'string') {
        return res.status(400).json({ error: 'Invalid domainName' });
    }

    try {
        const newInstitute = new Institute({
            instituteName,
            numberOfStudents,
            region,
            name,
            email,
            institutePhoneNumber,
            domainName
        });
        console.log('New institute:', newInstitute);

        await newInstitute.save();
        res.status(201).json({ message: 'Registration request processed!' });
    } catch (err) {
        console.error('Error during institute registration:', err);
        res.status(500).json({ error: err.message });
    }
};
