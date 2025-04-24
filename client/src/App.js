


import { BrowserRouter as Router, Routes, Route, useState } from 'react-router-dom';
import Lobby from './pages/Lobby';
import CodeBlock from './pages/CodeBlock';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Lobby />} />
        <Route path="/code/:id" element={<CodeBlock />} />
      </Routes>
    </Router>
  );
}

export default App;
