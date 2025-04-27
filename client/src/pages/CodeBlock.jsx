import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Lobby.css';
import { doc, getDoc } from 'firebase/firestore';
import db from '../firebase';
import Editor from "react-simple-code-editor";
import Prism from "prismjs";
import "prismjs/themes/prism.css"; 
import "prismjs/components/prism-javascript"; 
// Import PrismJS for syntax highlighting inside the code editor.

function CodeBlock() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [socket, setSocket] = useState(null);   // WebSocket connection.
  const [currentBlock, setCurrentBlock] = useState(null); 
  const [questionText, setQuestionText] = useState(''); 
  const [userAnswer, setUserAnswer] = useState('');
  const [showSmiley, setShowSmiley] = useState(false);   // Control showing a smiley image if the answer is correct.
  const [showTryAgain, setShowTryAgain] = useState(false);
  const [role, setRole] = useState('');
  const [studentsCount, setStudentsCount] = useState(0);
  const [studentsCodes, setStudentsCodes] = useState({});   // Dictionary to store all students' code answers.
  const [studentId, setStudentId] = useState('');

  useEffect(() => {
    // Fetching data and setting question data from Firestore when the page loads
    async function fetchBlock() {
      const docRef = doc(db, "code_blocks", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setCurrentBlock(data);
        setQuestionText(data.question_text);
        setUserAnswer(data.initial_code);
      } else {
        console.log("No such document!");
      }
    }
    fetchBlock();
  }, [id]);

  useEffect(() => {
    const newSocket = new WebSocket(`wss://codelab-1-0fmm.onrender.com/ws/${id}`);

    newSocket.onopen = () => {
      console.log("Connected to WebSocket server");
      setSocket(newSocket);
    };

    newSocket.onmessage = (event) => {
      console.log('Message from server:', event.data); 
      const data = JSON.parse(event.data);

      if (data.role) {
        if (data.role === "mentor") {
          setRole("Mentor");
        } else {
          setRole("Student");
        }
      }

      if (data.students !== undefined) {
        setStudentsCount(data.students);
      }

      if (data.action === "mentor_left") {
        navigate('/');
      }

      if (data.action === "update_all_codes") {
        setStudentsCodes(data.codes || {});
      }

      if (data.student_id) {
        setStudentId(data.student_id);
      }
    };

    newSocket.onclose = () => {
      console.log("WebSocket disconnected");
    };

    return () => {
      if (newSocket && (newSocket.readyState === WebSocket.OPEN || newSocket.readyState === WebSocket.CONNECTING)) {
        newSocket.close();
      }
    };
  }, [id, navigate]);

  const handleCheckAnswer = async () => {
    const response = await fetch("https://codelab-1-0fmm.onrender.com/check-answer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        question_name: id,
        user_code: userAnswer
      })
    });
    // Send the user's answer to the server to check correctness.

    const data = await response.json();

    if (data.result === "correct") {
      setShowSmiley(true);
      setShowTryAgain(false);
      setTimeout(() => setShowSmiley(false), 4000);
      // Show a smiley for 4 seconds if correct.
    } else {
      setShowSmiley(false);
      setShowTryAgain(true);
      setTimeout(() => setShowTryAgain(false), 4000);
    }
  };

  const handleBackToLobby = () => {
    if (role === "Mentor" && socket) {
      socket.send(JSON.stringify({ action: "mentor_left" }));
      // If user is mentor, notify others before leaving.
      navigate('/');
    } else {
      navigate('/');
    }
  };

  return (
    <div className="lobby-container">
      <h1>Code Block: {currentBlock?.title}</h1>
      <h3>Role: {role}</h3>

      {showSmiley && <img src="/smiley.png" alt="Correct!" className="smiley-image" />}
      {showTryAgain && <img src="/Mistake.png" alt="Try Again!" className="tryagain-image" />}

      <textarea className="question-text" value={questionText} readOnly />
      {/* Display the question text in a read-only textarea */}
      
      <Editor className='userAnswer-editor'
        value={userAnswer}
        onValueChange={(code) => {
          setUserAnswer(code);
          if (socket && role === "Student") {
            socket.send(JSON.stringify({ action: "update_code", code, student_id: studentId }));
          }
        }}
        highlight={code => Prism.highlight(code, Prism.languages.javascript, 'javascript')}
        // Highlight the syntax inside the editor using PrismJS
        readOnly={role === "Mentor"}
        // Make the editor read-only if the user is a Mentor
        style={{ padding: "10px" }}
      />

      {role === "Student" && (
        <button className="answer-check" onClick={handleCheckAnswer}>
          Check My Answer
        </button>
        // If the user is a Student, show a button to check their answer.
      )}
      {role === "Mentor" && (
        <div className="students-codes-container">
          <h2 className="students-title">Students Codes: </h2>
          {Object.entries(studentsCodes).map(([id, code]) => (
            <div key={id} className="student-code-card">
              <h4> Student {id} </h4>
              <Editor
                className="stuCode"
                value={code}
                highlight={code => Prism.highlight(code, Prism.languages.javascript, 'javascript')}
                readOnly={true}
              />
            </div>
          ))}
        </div>
      )}

      <div className="bottom-bar">
        <div className="user-counter">
          Students Online: {studentsCount - 1}
          {/* Display the number of online students (excluding mentor) */}
        </div>
        <button onClick={handleBackToLobby} className="lobby-button">
          Back to Lobby
        </button>
        {/* Button to return to the lobby page */}
      </div>
    </div>
  );
}

export default CodeBlock;
