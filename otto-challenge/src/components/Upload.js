import React, { Fragment, useState } from "react";

import Message from "./Message";
import Progress from "./Progress";
import axios from "axios";
import "./Upload.css";

const FileUpload = () => {
  const [file, setFile] = useState("");
  const [filename, setFilename] = useState("Choose File");
  const [uploadedFile, setUploadedFile] = useState({});
  const [message, setMessage] = useState("");
  const [uploadPercentage, setUploadPercentage] = useState(0);

  const onChange = (e) => {
    setFile(e.target.files[0]);
    setFilename(e.target.files[0].name);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post("/upload", formData, {
        headers: {
          "Content-Type": "application/x-shellscript",
        },
        onUploadProgress: (progressEvent) => {
          setUploadPercentage(
            parseInt(
              Math.round((progressEvent.loaded * 100) / progressEvent.total)
            )
          );
        },
      });

      // Clear percentage
      setTimeout(() => setUploadPercentage(0), 10000);
      const { report, stdout, stderr } = res.data.file;
      console.log(`stdout = ${stdout}`);
      console.log(`stderr = ${stderr}`);
      setUploadedFile({ report: report, stdout: stdout, stderr: stderr });
      setMessage("File Uploaded");
    } catch (err) {
      console.log(`Catch Error: ${err}`);
      if (err.response.status === 500) {
        setMessage("There was a problem with the server");
      } else {
        setMessage(err.response.data.msg);
      }
      setUploadPercentage(0);
    }
  };

  return (
    <Fragment>
      {message ? <Message msg={message} /> : null}
      <form onSubmit={onSubmit}>
        <div className="custom-file mb-4">
          <input
            type="file"
            className="custom-file-input"
            id="customFile"
            onChange={onChange}
          />
          <label className="custom-file-label" htmlFor="customFile">
            {filename}
          </label>
        </div>

        <Progress percentage={uploadPercentage} />

        <input
          type="submit"
          value="Upload"
          className="btn btn-primary btn-block mt-4"
        />
      </form>
      {uploadedFile ? (
        <div className="row mt-3">
          <div className="col-md-6 m-auto">
            {uploadedFile.stderr === "PROCESSING FAILURE ENCOUNTERED!" ? (
              <h5 style={{ color: "red" }}>{uploadedFile.stderr}</h5>
            ) : (
              <h3 className="text-center">{uploadedFile.stdout}</h3>
            )}
            <div className="vertical-scrollable">
              <p> {uploadedFile.report} </p>
            </div>
          </div>
        </div>
      ) : null}
    </Fragment>
  );
};

export default FileUpload;
