const { spawn } = require("node:child_process");
const fs = require("fs");
const path = require("path");
const driveService = require("@/services/drive.service");
const emailService = require("@/services/email.service");

let isRunning = false;

function backupDB() {
  if (isRunning) {
    console.log("Backup job đang chạy, bỏ qua lần gọi này...");
    return Promise.resolve();
  }
  isRunning = true;

  return new Promise((resolve) => {
    const backupDir = path.join(__dirname, "../../backup");
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const fileName = `${process.env.DB_NAME}-${timestamp}.sql`;
    const outputFile = path.join(backupDir, fileName);
    const outputStream = fs.createWriteStream(outputFile);

    const mysqldump = spawn(
      "mysqldump",
      [
        `-u${process.env.DB_USER}`,
        `-p${process.env.DB_PASS}`,
        `-h${process.env.DB_HOST}`,
        `-P${process.env.DB_PORT}`,
        process.env.DB_NAME,
      ],
      { shell: true },
    );

    mysqldump.stdout.pipe(outputStream);

    mysqldump.on("error", (error) => {
      outputStream.end();
      console.error(`mysqldump error: ${error.message}`);
      isRunning = false;
      resolve();
    });

    mysqldump.stderr.on("data", (data) => {
      console.error(`MySQL error: ${data.toString()}`);
    });

    mysqldump.on("close", async (code) => {
      outputStream.end();
      console.log(`child process exited with code ${code}`);

      if (code !== 0) {
        if (fs.existsSync(outputFile)) fs.unlinkSync(outputFile);
        console.error(
          `Backup pipeline failed: mysqldump exited with code ${code}`,
        );
        isRunning = false;
        return resolve();
      }

      try {
        console.log(`Backup successfully. File: ${outputFile}`);

        // Upload lên Google Drive thông qua drive.service.js (nơi duy nhất đụng tới googleapis)
        const uploaded = await driveService.uploadFile(outputFile, fileName);
        console.log(
          `Upload GDrive successfully! Link: ${uploaded.webViewLink}`,
        );

        // Gửi email thông báo cho quản trị viên
        await emailService.sendBackupReport(
          process.env.ADMIN_EMAIL,
          "Backup successfully!",
          { fileName, driveLink: uploaded.webViewLink },
        );
        console.log("Send email report successfully!");

        // Dọn file tạm ở local sau khi đã upload xong
        if (fs.existsSync(outputFile)) {
          fs.unlinkSync(outputFile);
        }
      } catch (error) {
        console.error("Backup pipeline failed:", error);
      } finally {
        isRunning = false;
        resolve();
      }
    });
  });
}

module.exports = backupDB;
