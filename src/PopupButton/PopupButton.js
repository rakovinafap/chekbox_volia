import React, { useState } from 'react';
import { Button, Modal, Box } from '@mui/material';
import TelegramIcon from '@mui/icons-material/Telegram';

import img1 from '../img/inc1.jpg';
import img2 from '../img/inc2.jpg';
import img3 from '../img/inc3.jpg';
import img4 from '../img/inc4.jpg';

const PopupButton = () => {
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      <Button variant="outlined" onClick={handleOpen}>
       Инструкція по користуванню
      </Button>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="popup-modal-title"
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            maxHeight: '90vh', // Максимальная высота контейнера
            overflowY: 'auto', // Прокрутка при необходимости
          }}
        >
          <h2 id="popup-modal-title">Инструкція по користуванню</h2>
          <div>
             <div style={{marginTop: "50px"}}>
              <span >
                Для початку роботи з сервісом потрібно натиснути "Відкрити зміну". <br/>
                Потім переходимо до таблиці та копіюємо три стовбці з потрібною інформацією (див. друге зображення).<br/>
                <u>Обовьязково потрібно копіювати починаючи з товару, потім оплата та останнім ціна.</u> <br/>
                Відкоригуйте ваш порядок стовпців у таблиці, згідно з вказаним в інструкції. <br/>
                В такому порядку вставляємо всі дані в поле "Масове створення чеків" та натискаємо "Парсити дані". <br/>
                <b>*Можливість обробки більше одного товару в одному замовленні не реалізовано. Будьте уважні!</b>
              </span>
          <img style={{marginTop: "10px"}} src={img2} width={"100%"}/>
          <img src={img1} width={"100%"}/>
            </div>
             <div style={{marginTop: "50px"}}>
             <hr/>
              <span>
              На даному етапі перевіряємо правильність розпарсених замовлень. <br/>
              Всі поля повинні бути заповнені. Корегуємо якщо потрібно. <br/>
              Зверніть увагу! Підтримуються не всі назви методів оплати <br/>
              Якщо використовувати стандартні назви методів оплати з таблиці - форматування працюватиме вірно.<br/>
                  <hr/>
                  <b>Перелік форматувань які встановлені сервісом:</b>
                  
                  <li>Наложка = "Готівка",</li>
                  <li>готівка = "Готівка",</li>
                  <li>Накладний = "Готівка",</li>
                  <li>Наложка р/р = "Картка",</li>
                  <li>Контроль оплаты = "Картка",</li>
                  <li>На карту = "Картка",</li>
                  <li>Карт = "Картка",</li>
                  <li>Карточка = "Картка"</li>
                  <li>на карту банка: "Картка"</li>
                  
                  <hr/>
              Якщо всі рядки заповнені вірно - натискаємо "Створити всі чеки". <br/>
              Надсилання запиту та обробка займає 5 секунд на 1 чек. <br/>
              Праворуч з'являться чеки біля кожного рядка. Бажано нічого не редагувати під час роботи скрипта.  <br/>
              Натискаэмо "Копіювати всі посилання"
              </span>
          <img src={img3} width={"100%"}/>    
            </div>
             <div style={{marginTop: "30px"}}>
              <hr/>
              <span >
                  Переходимо до таблиці, виділяємо перший рядок замовлення (показано на картинці стрілкою) <br/>
                  Вставляємо посилання на чеки в колонку. (CTRL+V) <br/>
                  Закриваємо зміну, буде сформаровано Z-звіт. 
                </span>
             </div>
          <img src={img4} width={"100%"}/>  
         
             <div style={{marginTop: "50px", marginBottom: "50px", textAlign: "center"}}>
              <hr/>
              <span>
                Це не фінальна версія проекту, а лише тимчасова як запасний варіант, поки Ви не знайдете для себе більш професійне рішення.
                Будь ласка, перед реальним початком роботи потестуйте на тестовій касі від чекбокс.
                Автор не несе відповідальності за невірно оформлені Вами чеки.
                Поставити запитання або повідомити про помилку можна за посиланням нижче.
              </span>  
            <div style={{margin: "20px"}}><a href='https://t.me/volia_D'><TelegramIcon fontSize='Large'/>Написати автору</a></div>
             </div>
          </div>
          <Button onClick={handleClose}>Повернутись</Button>
        </Box>
      </Modal>
    </div>
  );
};

export default PopupButton;
