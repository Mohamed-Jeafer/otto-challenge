const express = require("express");
const fileUpload = require("express-fileupload");
const { exec, execFile } = require("child_process");
const { v4: uuidv4 } = require("uuid");

const fs = require("fs");

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(fileUpload());

// Upload Endpoint
app.post("/upload", async (req, res) => {
  const details = {
    file: {
      report: "",
      stdout: "",
      stderr: "",
    },
    msg: "",
    status: 0,
  };
  const file = req.files.file;
  details.file.fileName = file.name;
  const path = `${__dirname}/scripts/${file.name}`;
  const newFile = `${__dirname}/scripts/${uuidv4()}.sh`;
  const reportPath = `${__dirname}/the_file_report.txt`;

  if (req.files === null) {
    return res.status(400).json({ msg: "No file uploaded" });
  }
  console.log(`File moving process started...`);
  file.mv(path, (error) => {
    if (error) {
      details.msg = "File move error";
      details.status = 400;
      console.error(error);
      return res.status(details.status).send(details);
    } else {
      console.log(`File moving process ended.`);
      fs.rename(path, newFile, (error) => {
        console.log(`File renaiming process started...`);
        if (error) {
          details.msg = "File renaming error";
          details.status = 400;
          console.error(error);
          return res.status(details.status).send(details);
        } else {
          console.log(`File renaiming process ended.`);
          exec(`chmod +x ${newFile}`, (error, stdout, stderr) => {
            console.log(`File CHMOD process started...`);
            if (error) {
              details.msg = "Error in changing execution permission";
              details.status = 400;
              console.error(error);
              return res.status(details.status).send(details);
            } else {
              console.log(stdout);
              console.warn(stderr);
              console.log(`File CHMOD process ended.`);
              console.log(`File execution process started...`);
              execFile(newFile, (error, stdout, stderr) => {
                if (error) {
                  details.msg = "PROCESSING FAILURE ENCOUNTERED!";
                  details.file.stderr = "PROCESSING FAILURE ENCOUNTERED!";
                  details.file.stdout = "";
                  details.file.report = "";
                  details.status = 200;
                  console.error(`Script execution error \n ${error}`);
                  return res.status(details.status).send(details);
                } else {
                  details.file.stderr = stderr;
                  details.file.stdout = stdout;
                  console.log(`File script execution ended.`);
                  if (stdout) {
                    fs.readFile(reportPath, (error, data) => {
                      if (error) {
                        details.msg = "Error reading the report";
                        details.status = 400;
                        console.error(error);
                        return res.status(details.status).send(details);
                      } else {
                        console.log(`Sending details to frontend...`);
                        details.msg = "File Uploaded successfully";
                        details.status = 200;
                        details.file.report = data.toString();
                        return res.status(details.status).send(details);
                      }
                    });
                  }
                }
              });
            }
          });
        }
      });
    }
  });
});


app.listen(5000, () => console.log("Server Started..."));
