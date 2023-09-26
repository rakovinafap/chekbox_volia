import React from 'react';
import KeyboardDoubleArrowDownIcon from '@mui/icons-material/KeyboardDoubleArrowDown';
import { Typography, Paper } from '@mui/material';

import img1 from '../img/prev1.jpg';
import img2 from '../img/prev2.jpg';
import img3 from '../img/prev3.jpg';



const PrevPage = () => {

  const projectChangesText = `
    - Додана можливість обрати способи оплати: "Безготівка" та "Післяплата".
    - Виправлено помилки та покращено продуктивність.
    - Оновлено дизайн інтерфейсу видів оплати.
  `;


  return (
    <div>
        <div style={{display: "flex", flexDirection: "column", marginTop: "50px", textAlign: "center", marginBottom: "50px"}}>
          <Typography variant="h6" component="h2">Створення чеків з гугл-таблиці в декілька кроків</Typography>
          <img src={img1} alt="img1"/>
        <p><KeyboardDoubleArrowDownIcon fontSize='large' style={{color: "#1f6a35", textAlign: "center"}}/></p>
          <img src={img2} alt="img2"/>
          <p><KeyboardDoubleArrowDownIcon fontSize='large' style={{color: "#1f6a35", textAlign: "center"}}/></p>
          <img src={img3} alt="img3" style={{marginBottom: "50px"}}/>
      </div>
            <Paper elevation={3} style={{ padding: '16px', margin: '16px', width: '1000px' }}>
            <Typography variant="h4" gutterBottom style={{"textAlign": "center"}}>
            Останні зміни у проекті:
            </Typography>
            <Typography variant="body1">
              {projectChangesText.split('\n').map((line, index) => (
                <span textAlign="center" key={index}>
                  {line}
                  <br />
                </span>
              ))}
            </Typography>
          </Paper>
    </div>
    
  );
};

export default PrevPage;
