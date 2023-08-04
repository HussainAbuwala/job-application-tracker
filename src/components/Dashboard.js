import React, { useState } from "react";
import { Card, Button, Alert } from "react-bootstrap";
import { useAuth } from "../contexts/AuthContext";
import "./Dashboard.css";

export default function Dashboard() {
  const initialData = [
    {
      id: 1,
      company: "Apple",
      position: "Software Engineer",
      stage: "Applied",
      dueDate: "2023-08-15",
      resume: "",
    },
    {
      id: 2,
      company: "Google",
      position: "Web Developer",
      stage: "Interviewed",
      dueDate: "2023-08-20",
      resume: "",
    },
    {
      id: 3,
      company: "Microsoft",
      position: "Full Stack Developer",
      stage: "Interviewed",
      dueDate: "2023-08-20",
      resume: "",
    },
    {
      id: 4,
      company: "Facebook",
      position: "ML Engineer",
      stage: "Interviewed",
      dueDate: "2023-08-20",
      resume: "",
    },
    // Add more data as needed
  ];

  const [data, setData] = useState(initialData);
  const [editCell, setEditCell] = useState({ rowId: null, field: null });
  const [showDeleteButton, setShowDeleteButton] = useState(false);

  const handleCellClick = (rowId, field) => {
    setEditCell({ rowId, field });
  };

  const handleCellBlur = () => {
    setEditCell({ rowId: null, field: null });
  };

  const handleCellValueChange = (event, rowId, field) => {
    const updatedData = data.map((item) =>
      item.id === rowId ? { ...item, [field]: event.target.value } : item
    );
    setData(updatedData);
  };

  function handleMouseEnter(e, rowId) {
    setShowDeleteButton(true);
    setEditCell({ rowId: rowId, field: null });
  }

  function handleMouseLeave() {
    setShowDeleteButton(false);
    setEditCell({ rowId: null, field: null });
  }

  function handleDelete(e, rowId) {
    const newData = data.filter((item) => item.id !== rowId);
    setData(newData);
  }

  function addRecord(e) {
    const emptyRecord = {
      id: 5,
      company: "",
      position: "",
      stage: "",
      dueDate: "",
      resume: "",
    };
    const newData = [...data, emptyRecord];
    setData(newData);
  }

  function handleResumeChange(e, rowId, field) {
    const selectedFile = e.target.files[0];

    if (selectedFile) {
      console.log("Selected File:", selectedFile);
      console.log("File Name:", selectedFile.name);
      console.log("File Size:", selectedFile.size);
      console.log("File Type:", selectedFile.type);
    }

    const updatedData = data.map((item) =>
      item.id === rowId ? { ...item, [field]: selectedFile.name } : item
    );
    setData(updatedData);
  }

  const sortDataByField = (fieldName, order) => {
    let newArray = [...data];
    newArray.sort((a, b) => {
      const fieldValueA = a[fieldName];
      const fieldValueB = b[fieldName];

      let comparisonResult = 0;

      if (fieldValueA < fieldValueB) {
        comparisonResult = -1;
      } else if (fieldValueA > fieldValueB) {
        comparisonResult = 1;
      }
      return order === "desc" ? -comparisonResult : comparisonResult;
    });
    setData(newArray);
  };

  function getStageClass(stage) {
    let stageClass = "";
    if (stage === "Ready to apply") {
      stageClass = "to-do";
    } else if (
      stage === "Messaged recruiter" ||
      stage === "Referred" ||
      stage === "Applied" ||
      stage === "Followed up" ||
      stage === "Interviewed"
    ) {
      stageClass = "in-progress";
    } else if (stage === "Signed" || stage === "Offered") {
      stageClass = "complete";
    }
    else{
      stageClass = "rejected"
    }
    stageClass += " stage-tag";
    return stageClass
  }

  return (
    <div className="table-responsive table-container">
      <table className="table mt-4 custom-table">
        <thead>
          <tr>
            <th className="delete-cell"></th>
            <th>
              Company Name
              <i
                className="bi bi-arrow-down-square m-2"
                onClick={(e) => sortDataByField("company", "desc")}
                style={{ cursor: "pointer" }}
              ></i>
              <i
                className="bi bi-arrow-up-square"
                onClick={(e) => sortDataByField("company", "asc")}
                style={{ cursor: "pointer" }}
              ></i>
            </th>
            <th>
              Position
              <i
                className="bi bi-arrow-down-square m-2"
                onClick={(e) => sortDataByField("position", "desc")}
                style={{ cursor: "pointer" }}
              ></i>
              <i
                className="bi bi-arrow-up-square"
                onClick={(e) => sortDataByField("position", "asc")}
                style={{ cursor: "pointer" }}
              ></i>
            </th>
            <th>
              Stage
              <i
                className="bi bi-arrow-down-square m-2"
                onClick={(e) => sortDataByField("stage", "desc")}
                style={{ cursor: "pointer" }}
              ></i>
              <i
                className="bi bi-arrow-up-square"
                onClick={(e) => sortDataByField("stage", "asc")}
                style={{ cursor: "pointer" }}
              ></i>
            </th>
            <th>
              Due Date
              <i
                className="bi bi-arrow-down-square m-2"
                onClick={(e) => sortDataByField("dueDate", "desc")}
                style={{ cursor: "pointer" }}
              ></i>
              <i
                className="bi bi-arrow-up-square"
                onClick={(e) => sortDataByField("dueDate", "asc")}
                style={{ cursor: "pointer" }}
              ></i>
            </th>
            <th>Resume</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.id}>
              <td
                onMouseEnter={(e) => handleMouseEnter(e, item.id)}
                onMouseLeave={(e) => handleMouseLeave()}
                className="delete-cell"
              >
                {editCell.rowId === item.id && showDeleteButton && (
                  <i
                    onClick={(e) => handleDelete(e, item.id)}
                    className="bi bi-trash"
                    style={{ cursor: "pointer" }}
                  ></i>
                )}
              </td>
              <td
                onClick={() => handleCellClick(item.id, "company")}
                onBlur={handleCellBlur}
              >
                {editCell.rowId === item.id && editCell.field === "company" ? (
                  <input
                    type="text"
                    value={item.company}
                    onChange={(e) =>
                      handleCellValueChange(e, item.id, "company")
                    }
                    autoFocus
                  />
                ) : (
                  <i class="bi bi-building">{item.company}</i>
                )}
              </td>
              <td
                onClick={() => handleCellClick(item.id, "position")}
                onBlur={handleCellBlur}
              >
                {editCell.rowId === item.id && editCell.field === "position" ? (
                  <input
                    type="text"
                    value={item.position}
                    onChange={(e) =>
                      handleCellValueChange(e, item.id, "position")
                    }
                    autoFocus
                  />
                ) : (
                  <span className="position-container">{item.position}</span>
                )}
              </td>
              <td
                onClick={() => handleCellClick(item.id, "stage")}
                onBlur={handleCellBlur}
              >
                {editCell.rowId === item.id && editCell.field === "stage" ? (
                  <select
                    value={item.stage}
                    onChange={(e) => handleCellValueChange(e, item.id, "stage")}
                    autoFocus
                  >
                    <option value="Ready to apply">Ready to apply</option>
                    <option value="Messaged recruiter">Messaged recruiter</option>
                    <option value="Referred">Referred</option>
                    <option value="Applied">Applied</option>
                    <option value="Followed up">Followed up</option>
                    <option value="Interviewed">Interviewed</option>
                    <option value="Signed">Signed</option>
                    <option value="Offered">Offered</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                ) : (
                  <span className={getStageClass(item.stage)}>{item.stage}</span>
                )}
              </td>
              <td
                onClick={() => handleCellClick(item.id, "dueDate")}
                onBlur={handleCellBlur}
              >
                {editCell.rowId === item.id && editCell.field === "dueDate" ? (
                  <input
                    type="date"
                    value={item.dueDate}
                    onChange={(e) =>
                      handleCellValueChange(e, item.id, "dueDate")
                    }
                    autoFocus
                  />
                ) : (
                  <i class="bi bi-calendar"> {item.dueDate} </i>
                )}
              </td>
              <td>
                {editCell.rowId === item.id && editCell.field === "resume" ? (
                  <div>
                    <input
                      type="file"
                      onChange={(e) => handleResumeChange(e, item.id, "resume")}
                      accept=".pdf,.docx"
                    />
                    {item.resume && (
                      <button className="btn btn-link">{item.resume}</button>
                    )}
                  </div>
                ) : (
                  <button
                    className="btn btn-link"
                    onClick={() => handleCellClick(item.id, "resume")}
                    onBlur={handleCellBlur}
                  >
                    {item.resume ? item.resume : "Upload Resume"}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <i
        class="bi bi-plus-square-fill plus-icon"
        style={{ cursor: "pointer" }}
        onClick={addRecord}
      ></i>
    </div>
  );
}
