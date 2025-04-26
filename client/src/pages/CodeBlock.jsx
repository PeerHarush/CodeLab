import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Lobby.css';
import { doc, getDoc } from 'firebase/firestore';
import db from '../firebase';

function CodeBlock() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [socket, setSocket] = useState(null);
  const [currentBlock, setCurrentBlock] = useState(null);
  const [questionText, setQuestionText] = useState('');
  const [userAnswer, setUserAnswer] = useState('');
  const [showSmiley, setShowSmiley] = useState(false);
  const [showTryAgain, setShowTryAgain] = useState(false);
  const [role, setRole] = useState("");

  useEffect(() => {
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
    const newSocket = new WebSocket(`ws://localhost:8000/ws/${id}`);
    setSocket(newSocket);

    newSocket.onopen = () => {
      console.log("Connected to WebSocket server");
    };

    newSocket.onmessage = (event) => {
      console.log("Received from server:", event.data);
      if (event.data === "mentor") {
        setRole("Mentor");
      } else if (event.data === "student") {
        setRole("Student");
      }
    };

    newSocket.onclose = () => {
      console.log("WebSocket disconnected");
    };

    return () => {
      newSocket.close();
    };
  }, [id]);

  const handleCheckAnswer = async () => {
    const response = await fetch("http://localhost:8000/check-answer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        question_name: id,
        user_code: userAnswer
      })
    });

    const data = await response.json();

    if (data.result === "correct") {
      setShowSmiley(true);
      setShowTryAgain(false);
      setTimeout(() => setShowSmiley(false), 4000);
    } else {
      setShowSmiley(false);
      setShowTryAgain(true);
      setTimeout(() => setShowTryAgain(false), 4000);
    }
  };

  return (
    <div className="lobby-container">
      <h1>Code Block: {currentBlock?.title}</h1>
      <h3>Role: {role}</h3>

      {showSmiley && <img src="/smiley.png" alt="Correct!" className="smiley-image" />}
      {showTryAgain && <img src="/Mistake.png" alt="Try Again!" className="tryagain-image" />}

      <textarea className="question-text" value={questionText} readOnly />
      <textarea
        className="userAnswer-text"
        value={userAnswer}
        onChange={(e) => setUserAnswer(e.target.value)}
      />

      <button className="answer-check" onClick={handleCheckAnswer}>
        Check My Answer
      </button>

      <div className="bottom-bar">
        <div className="user-counter">Users Online: </div>
        <button onClick={() => navigate('/')} className="lobby-button">
          Back to Lobby
        </button>
      </div>
    </div>
  );
}

export default CodeBlock;
