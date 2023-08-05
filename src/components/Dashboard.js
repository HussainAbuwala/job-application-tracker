import React, { useState, useEffect } from "react";
import "./Dashboard.css";
import { db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

export default function Dashboard() {
  const { currentUser } = useAuth();
  const [data, setData] = useState([]);
  const [editCell, setEditCell] = useState({ rowId: null, field: null });
  const [showDeleteButton, setShowDeleteButton] = useState(false);
  const storage = getStorage();

  useEffect(() => {
    async function fetchData() {
      const userId = currentUser.uid; // Replace this with the user ID you want to match

      // Create a reference to the collection you want to query
      const usersCollectionRef = collection(db, "users");

      // Create a query to filter documents based on the user ID field
      const q = query(usersCollectionRef, where("id", "==", userId));

      try {
        const querySnapshot = await getDocs(q);
        let allUserData = [];
        querySnapshot.forEach((doc) => {
          console.log("Document Retrieved ID:", doc.id);
          let newData = doc.data();
          newData.docID = doc.id;
          allUserData.push(newData);
        });
        setData(allUserData);
      } catch (error) {
        console.error("Error getting documents:", error);
      }
    }

    fetchData();
  }, []);

  const handleCellClick = (rowId, field) => {
    setEditCell({ rowId, field });
  };

  async function handleCellBlur(item) {
    const userDocRef = doc(db, "users", item.docID);
    let newData = { ...item };
    delete newData.docID;

    // Using async/await
    try {
      await updateDoc(userDocRef, newData);
      console.log("Document updated successfully");
    } catch (error) {
      console.error("Error updating document: ", error);
    }

    setEditCell({ rowId: null, field: null });
  }

  const handleCellValueChange = (event, rowId, field) => {
    const updatedData = data.map((item) =>
      item.docID === rowId ? { ...item, [field]: event.target.value } : item
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

  async function handleDelete(item) {
    const newData = data.filter((record) => record.docID !== item.docID);
    const documentId = item.docID; // Replace this with the ID of the document you want to delete

    // Create a reference to the document you want to delete
    const documentRef = doc(db, "users", documentId);

    // Using async/await to delete the document
    try {
      await deleteDoc(documentRef);
      console.log("Document successfully deleted.");
    } catch (error) {
      console.error("Error deleting document: ", error);
    }
    setData(newData);
  }

  async function addRecord(e) {
    let emptyRecord = {
      id: currentUser.uid,
      company: "",
      position: "",
      stage: "",
      dueDate: "",
      resume: [],
    };

    try {
      const docRef = await addDoc(collection(db, "users"), emptyRecord);
      console.log("Document written with ID: ", docRef.id);
      emptyRecord.docID = docRef.id;
    } catch (e) {
      console.error("Error adding document: ", e);
    }

    const newData = [...data, emptyRecord];
    setData(newData);
  }

  function handleResumeChange(e, record, field) {
    const selectedFile = e.target.files[0];

    if (selectedFile) {
      console.log("Selected File:", selectedFile);
      console.log("File Name:", selectedFile.name);
      console.log("File Size:", selectedFile.size);
      console.log("File Type:", selectedFile.type);
    }

    if (selectedFile) {
      const path = `pdfs/${currentUser.uid}/${record.docID}/${selectedFile.name}`;
      const storageRef = ref(storage, path);
      const fileRef = ref(storage, path);

      uploadBytes(storageRef, selectedFile)
        .then(() => {
          console.log("PDF uploaded successfully.");
          getDownloadURL(fileRef)
            .then(async (url) => {
              const updatedData = data.map((item) =>
                item.docID === record.docID
                  ? {
                      ...item,
                      [field]: [
                        ...item.resume,
                        { filename: selectedFile.name, downloadURL: url },
                      ],
                    }
                  : item
              );
              let newRecord = { ...record };
              newRecord.resume.push({
                filename: selectedFile.name,
                downloadURL: url,
              });

              const userDocRef = doc(db, "users", record.docID);
              delete newRecord.docID;

              // Using async/await
              try {
                await updateDoc(userDocRef, newRecord);
                console.log("Document updated successfully");
              } catch (error) {
                console.error("Error updating document: ", error);
              }

              setData(updatedData);
            })
            .catch((error) => {
              console.error("Error getting download URL:", error);
            });
        })
        .catch((error) => {
          console.error("Error uploading PDF:", error);
        });
    }
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
    } else {
      stageClass = "rejected";
    }
    stageClass += " stage-tag";
    return stageClass;
  }

  async function handleFileDelete(record, filename) {
    const updatedData = data.map((item) =>
      item.docID === record.docID
        ? {
            ...item,
            resume: item.resume.filter((obj) => obj.filename !== filename),
          }
        : item
    );

    const path = `pdfs/${currentUser.uid}/${record.docID}/${filename}`
    const fileRef = ref(storage, path);

    deleteObject(fileRef)
      .then(() => {
        console.log("File deleted successfully.");
      })
      .catch((error) => {
        console.error("Error deleting file:", error);
      });
    
    let newRecord = {...record, resume: record.resume.filter((obj) => obj.filename !== filename)}
    delete newRecord.docID;

    const userDocRef = doc(db, "users", record.docID);    

    // Using async/await
    try {
      await updateDoc(userDocRef, newRecord);
      console.log("Document updated successfully");
    } catch (error) {
      console.error("Error updating document: ", error);
    }
    
    setData(updatedData)
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
            <tr key={item.docID}>
              <td
                onMouseEnter={(e) => handleMouseEnter(e, item.docID)}
                onMouseLeave={(e) => handleMouseLeave()}
                className="delete-cell"
              >
                {editCell.rowId === item.docID && showDeleteButton && (
                  <i
                    onClick={(e) => handleDelete(item)}
                    className="bi bi-trash"
                    style={{ cursor: "pointer" }}
                  ></i>
                )}
              </td>
              <td
                onClick={() => handleCellClick(item.docID, "company")}
                onBlur={(e) => handleCellBlur(item)}
              >
                {editCell.rowId === item.docID &&
                editCell.field === "company" ? (
                  <input
                    type="text"
                    value={item.company}
                    onChange={(e) =>
                      handleCellValueChange(e, item.docID, "company")
                    }
                    autoFocus
                  />
                ) : (
                  item.company ? <i className="bi bi-building">{item.company}</i> : ""
                )}
              </td>
              <td
                onClick={() => handleCellClick(item.docID, "position")}
                onBlur={(e) => handleCellBlur(item)}
              >
                {editCell.rowId === item.docID &&
                editCell.field === "position" ? (
                  <input
                    type="text"
                    value={item.position}
                    onChange={(e) =>
                      handleCellValueChange(e, item.docID, "position")
                    }
                    autoFocus
                  />
                ) : (
                  item.position ? <span className="position-container">{item.position}</span> : ""
                )}
              </td>
              <td
                onClick={() => handleCellClick(item.docID, "stage")}
                onBlur={(e) => handleCellBlur(item)}
              >
                {editCell.rowId === item.docID && editCell.field === "stage" ? (
                  <select
                    value={item.stage}
                    onChange={(e) =>
                      handleCellValueChange(e, item.docID, "stage")
                    }
                    autoFocus
                  >
                    <option value="Ready to apply">Ready to apply</option>
                    <option value="Messaged recruiter">
                      Messaged recruiter
                    </option>
                    <option value="Referred">Referred</option>
                    <option value="Applied">Applied</option>
                    <option value="Followed up">Followed up</option>
                    <option value="Interviewed">Interviewed</option>
                    <option value="Signed">Signed</option>
                    <option value="Offered">Offered</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                ) : (
                  item.stage ? <span className={getStageClass(item.stage)}> {item.stage} </span> : ""
                )}
              </td>
              <td
                onClick={() => handleCellClick(item.docID, "dueDate")}
                onBlur={(e) => handleCellBlur(item)}
              >
                {editCell.rowId === item.docID &&
                editCell.field === "dueDate" ? (
                  <input
                    type="date"
                    value={item.dueDate}
                    onChange={(e) =>
                      handleCellValueChange(e, item.docID, "dueDate")
                    }
                    autoFocus
                  />
                ) : (
                  item.dueDate ? <i className="bi bi-clock-fill"> {item.dueDate} </i> : ""
                )}
              </td>
              <td onMouseLeave={(e) => handleCellBlur(item)} className="resume-cell">
                {editCell.rowId === item.docID &&
                editCell.field === "resume" ? (
                  <div>
                    <input
                      type="file"
                      onChange={(e) => handleResumeChange(e, item, "resume")}
                      accept=".pdf,.docx"
                    />
                    {item.resume.map((file, index) => (
                      <div key={index}>
                        <a target="_blank" rel="noreferrer" href={file.downloadURL}>
                          {file.filename}
                        </a>{" "}
                        <i
                          className="bi bi-x-square"
                          onClick={(e) => handleFileDelete(item, file.filename)}
                          style={{ cursor: "pointer" }}
                        ></i>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    onClick={() => handleCellClick(item.docID, "resume")}
                  >
                    {item.resume.length === 0 ? <br></br> : ""}
                    {item.resume.map((file, index) => (
                      <div className="resume-items" key={index}>{file.filename}</div>
                    ))}
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <i
        className="bi bi-plus-square-fill plus-icon"
        style={{ cursor: "pointer" }}
        onClick={addRecord}
      ></i>
    </div>
  );
}
