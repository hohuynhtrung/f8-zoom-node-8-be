const fs = require("fs");
const { google } = require("googleapis");

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI,
);

oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

class DriveService {
  constructor() {
    this.drive = google.drive({ version: "v3", auth: oauth2Client });
  }

  async uploadFile(filePath, fileName, mimeType = "application/sql") {
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

    const response = await this.drive.files.create({
      requestBody: {
        name: fileName,
        parents: folderId ? [folderId] : undefined,
      },
      media: {
        mimeType,
        body: fs.createReadStream(filePath),
      },
      fields: "id, webViewLink",
    });

    return response.data;
  }
}

module.exports = new DriveService();
