import React from 'react'
import { useState } from 'react';
import axios from 'axios';
import "../App.css";

function Upload() {

    const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [response, setResponse] = useState(null);

  const handleFileChange = (e) =>{
    // e.preventDefault();
    const file = e.target.files[0];
    setImage(file);
    setPreview(URL.createObjectURL(file));
  }

  const handleUpload = async() =>{
    if(!image) return alert("Please Upload An Image First");
    setUploading(true);

    const formData = new FormData();
    formData.append("image",image);

    try{
      const res = await axios.post("http://localhost:5000/meals",formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResponse(res.data.response);
    }
    catch (err) {
      console.error(err);
    } 
    finally {
      setUploading(false);
    }
  }

  return (
    <div className="app">
      <h2>Upload The Image of Your Food</h2>

      <input type="file" accept="image/*" onChange={handleFileChange} />

      {preview && (
        <div className="preview">
          <img src={preview} alt="Preview" />
        </div>
      )}

      <button onClick={handleUpload} disabled={uploading}>
        {uploading ? "Uploading..." : "Upload"}
      </button>

      {response && (<div>
        <h3>Calorie Estimation :</h3>
        <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
        {response}
        </pre>
      </div>)}
    </div>
  )
}

export default Upload