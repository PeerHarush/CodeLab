
  import React from 'react';
  import { useNavigate } from 'react-router-dom';
  import './Lobby.css';
  import { collection, getDocs } from 'firebase/firestore';
  import { useEffect, useState } from 'react';
  import db from '../firebase'; 


  function Lobby() {
    const [codeBlocks, setCodeBlocks] = useState([]); //יצירת משתנה שאליו ייכנסו השאלות 
    const navigate = useNavigate();

    useEffect(() => {
      async function fetchData() {
        const querySnapshot = await getDocs(collection(db, "code_blocks")); //אובייקט שאליו נכנסים המסמכים שמביאים מהדאטה בייס שלנו 
        const blocks = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.title,
            question_text: data.question_text,
            solution_code: data.solution_code,
            initial_code: data.initial_code
          };
        });
        setCodeBlocks(blocks); //מכניס את כל השאלות שקיבלנו לתוך codeBlocks
        }
       fetchData();
      }, []);
    return (
      <div className="lobby-container">
        <h1 className="lobby-title"> Hello:) </h1>
        <h2>Choose code block</h2>
        {codeBlocks.map((block) => ( <button
            key={block.id}
            onClick={() => navigate('/code/' + block.id)}
            className="lobby-button"
          >
            {block.title}
          </button>
           ))}
      </div>
    );
  }
  
  export default Lobby;