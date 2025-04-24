import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Lobby.css';
import {doc, getDoc, collection} from 'firebase/firestore'; 
import db from '../firebase'; 


function CodeBlock() {
  const { id } = useParams(); //מזהה של השאלה מתוך ה־URL
  const navigate = useNavigate();
  const [currentBlock, setCurrentBlock] = useState(null);
  const [questionText, setQuestionText] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  
  useEffect(() => { //שליפת השאלה מהדאטה בייס
    async function fetchBlock() {
      const docRef = doc(db, "code_blocks", id); //יצירת כתובת למסמך
      const docSnap = await getDoc(docRef); 
      if (docSnap.exists()) {
        const data = docSnap.data();
        setCurrentBlock(data);
        setQuestionText(data.question_text); // מציג את השאלה 
        setUserAnswer(data.initial_code);
      } else {
        console.log("No such document!");
      }
    }
  
    fetchBlock(); // הפעלת הפונקציה
  }, [id]);
  

  return (
    <div className="lobby-container">

<h1>Code Block: {currentBlock?.title}</h1>


      <textarea className="question-text" value={questionText} readOnly>  </textarea>

      <textarea className="userAnswer-text"
        value={userAnswer}
        onChange={(e) => setUserAnswer(e.target.value)}
      />
      
      <button
        className="answer-check"
      >
       Check My Answer
      </button>


      <button
        onClick={() => navigate('/')}
        className="lobby-button two"
      >
        Back to Lobby
      </button>
    </div>

   
  );
}

export default CodeBlock;
