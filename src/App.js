import React, { useState } from 'react';
import MainComponent from './mainComponent/mainComponent';
import Footer from './footerPage/footerPage';
import Favicon from 'react-favicon';
import { Analytics } from '@vercel/analytics/react';

import './App.css';

function App(props) {
  document.title = "Масове створення чеків";
  

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
       <Favicon  url="https://cdn.icon-icons.com/icons2/1499/PNG/512/emblemdefault_103452.png" />
      <MainComponent />
      <Footer />
      <Analytics />
    </div>
  );
}

export default App;
