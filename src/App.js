import React, { useState } from 'react';
import MainComponent from './mainComponent/mainComponent';
import Footer from './footerPage/footerPage';


import './App.css';

function App(props) {
  document.title = "chekbox_Volia";

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <MainComponent />
      <Footer />
    </div>
  );
}

export default App;
