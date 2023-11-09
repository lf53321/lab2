import React from 'react';
import './App.css';
import SqlAttack from "./SqlAttack";
import BrokenAuth from "./BrokenAuth";

function App() {
  return (
    <div className="App">
        <h1>Lab2 Security</h1>
        <SqlAttack></SqlAttack>
        <BrokenAuth></BrokenAuth>
    </div>
  );
}

export default App;
