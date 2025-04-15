const { google } = require('googleapis');
const fs = require('fs');

let driveClient = null;
let ROOT_FOLDER_ID = null;

const initializeDrive = async () => {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      scopes: ['https://www.googleapis.com/auth/drive']
    });

    driveClient = google.drive({ version: 'v3', auth });

    // Find or create root folder
    const folderName = process.env.GOOGLE_DRIVE_PARENT_FOLDER || 'smartclassroom-files';
    const response = await driveClient.files.list({
      q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      fields: 'files(id, name)',
    });

    if (response.data.files.length > 0) {
      ROOT_FOLDER_ID = response.data.files[0].id;
      console.log('Using existing Drive folder:', folderName);
    } else {
      // Create root folder
      const folderMetadata = {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder'
      };
      
      const folder = await driveClient.files.create({
        resource: folderMetadata,
        fields: 'id'
      });
      
      ROOT_FOLDER_ID = folder.data.id;
      console.log('Created new Drive folder:', folderName);
    }

    return driveClient;
  } catch (error) {
    console.error('Failed to initialize Google Drive:', error);
    return null;
  }
};

const getDriveClient = () => {
  if (!driveClient) {
    driveClient = initializeDrive();
  }
  return driveClient;
};

const uploadFile = async (file, parents = []) => {
  try {
    const drive = getDriveClient();
    if (!drive) {
      throw new Error('Google Drive client not initialized');
    }

    const response = await drive.files.create({
      requestBody: {
        name: file.originalname,
        mimeType: file.mimetype,
        parents: parents
      },
      media: {
        mimeType: file.mimetype,
        body: fs.createReadStream(file.path)
      }
    });

    return {
      id: response.data.id,
      webViewLink: response.data.webViewLink,
      webContentLink: response.data.webContentLink
    };
  } catch (error) {
    console.error('Error uploading file to Google Drive:', error);
    throw error;
  }
};

const getClassFolder = async (classId) => {
  try {
    if (!ROOT_FOLDER_ID) {
      await createRootFolder();
    }

    const drive = getDriveClient();
    if (!drive) throw new Error('Drive client not initialized');

    // Check if class folder exists
    const response = await drive.files.list({
      q: `name='${classId}' and mimeType='application/vnd.google-apps.folder' and '${ROOT_FOLDER_ID}' in parents and trashed=false`,
      fields: 'files(id, name)',
    });

    if (response.data.files.length > 0) {
      return { id: response.data.files[0].id };
    }

    // Create class folder if it doesn't exist
    const folderMetadata = {
      name: classId,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [ROOT_FOLDER_ID]
    };

    const folder = await drive.files.create({
      resource: folderMetadata,
      fields: 'id'
    });

    return { id: folder.data.id };
  } catch (error) {
    console.error('Error getting/creating class folder in Google Drive:', error);
    throw error;
  }
};

module.exports = {
  uploadFile,
  getClassFolder
};
