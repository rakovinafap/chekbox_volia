import React from 'react';

const Footer = () => {
  return (
    <footer 
      style={{ 
        backgroundColor: '#333',  // Цвет фона футера
        padding: '10px', 
        textAlign: 'center', 
        marginTop: 'auto', 
        width: "100%",
        background: "rgb(2,0,36)",
        background: "linear-gradient(90deg, rgb(254 254 254) 0%, rgb(238 238 238) 50%, rgb(255 255 255) 100%)"
      }}
    >
      <span style={{fontSize: "14px"}}>created by</span> <b><a href='https://t.me/volia_D'>Volia</a></b><br/>
      <span style={{fontSize: "12px"}} title='Добавлены способы оплаты: "Післяплата" и "Безготівка"'>Version 1.0.2</span>
    </footer>
  );
};

export default Footer;
