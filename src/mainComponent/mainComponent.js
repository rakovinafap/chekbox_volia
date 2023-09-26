import React, { useState } from "react";
import PopupButton from '../PopupButton/PopupButton'; 
import PrevPage from '../prevPage/prevPage';
import {v4 as uuidv4} from 'uuid';
import clipboardCopy from 'clipboard-copy';
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";
import { TextField, Grid, Divider } from '@mui/material';

import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';

import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';

import { Select, MenuItem } from '@mui/material';
import { TextareaAutosize } from '@mui/base/TextareaAutosize';

import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';

import Typography from '@mui/material/Typography';

import ArrowCircleDownIcon from '@mui/icons-material/ArrowCircleDown';



const LoginDiv = styled("div")({
  /*  backgroundColor: "#f2f2f2", */
   paddingTop: "40px", 
   borderRadius: "8px",
   fontSize: "16px",
   color: "black",
   display: "flex",
   alignItems: "center",
   justifyContent: "center",
   flexDirection: "row",
  /*  minHeight: "50vh", // Если вы хотите центрировать по вертикали  */
   width: "100%",     // Можете добавить, чтобы центрировать по горизонтали
 });

const CustomDiv = styled("div")({
   /*  backgroundColor: "#f2f2f2", */
   /*  paddingTop: "10px", */
    borderRadius: "8px",
    fontSize: "16px",
    color: "black",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
   /*  minHeight: "50vh", // Если вы хотите центрировать по вертикали  */
    width: "100%",     // Можете добавить, чтобы центрировать по горизонтали
  });

  const BalanceDiv = styled("div")({
    /*  backgroundColor: "#f2f2f2", */
    /*  padding: "10px", */
     fontSize: "16px",
     color: "black",
     display: "flex",
     alignItems: "center",
     justifyContent: "center",
     flexDirection: "column",
    /*  alignItems: "stretch" */
   });

   const StatusInfoDiv = styled("div")({
     fontSize: "16px",
     color: "black",
     display: "flex",
     /* alignItems: "center", */
     justifyContent: "center",
     flexDirection: "column",
     alignItems: "stretch" 
   });

   const BalanceInDiv = styled("div")({
    /*  backgroundColor: "#f2f2f2", */
     padding: "4px",
     /* margin: "5px", */
     /* fontSize: "12px", */
     color: "black",
     display: "flex",
    /*  alignItems: "center", */
     justifyContent: "center",
     flexDirection: "row",
     alignItems: "stretch"
   });

  
 
   



const MainComponent = () => {
  const [pinCode, setPinCode] = useState("");
  const [licenseKey, setLicenseKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOffline, setIsOffline] = useState(true);
  const [taxServiceStatus, setTaxServiceStatus] = useState(null);
  const [openStore, setOpenStore] = useState(null);
  const [userName, setUserName] = useState(null);
  const [urlCheck, setUrlCheck] = useState([]);
  const [creatingLink, setCreatingLink] = useState(false);

  const [balanceUser, setBalanceUser] = useState(null);
  const [depositAmount, setDepositAmount] = useState(""); // Состояние для внесения готівки
  const [withdrawAmount, setWithdrawAmount] = useState(""); // Состояние для выдачи готівки

  const [loginFail, setLoginFail] = useState(false)
  const [hasStatusShift, setHasStatusShift] = useState();

  // Хук для хранения данных о товарах соло чека
  const [products, setProducts] = useState([
    { name: '', quantity: '', price: '' }
  ]);
  
  // Хук для хранения способа оплаты соло чека
  const [paymentMethod, setPaymentMethod] = useState("Готівка"); // Начальное значение
  const [oneCheckUrl, setOneCheckUrl] = useState(null);

  //Z-output 
  const [zOutput, setZOutput] = useState({
    balance: {
      initial: 0,
      balance: 0,
      cash_sales: 0,
      card_sales: 0,
      cash_returns: 0,
      card_returns: 0,
      service_in: 0,
      service_out: 0,
    },
    z_report: { 
      sell_receipts_count: 0,
    },
  });
  
  const [closeZ, setCloseZ] = useState(false);
  const [zreport, setZreport] = useState(null); // Состояние для рендера Z-чека
 

  const defaultProductQuantity = 1;
 
  const [productQuantities, setProductQuantities] = useState([]);

 


  const fetchCashRegisterInfo = async () => {
    try {
      const response = await fetch("https://api.checkbox.ua/api/v1/cash-registers/info", {
        headers: {
          accept: "application/json",
          "X-Client-Name": "Integration",
          "X-Client-Version": "1.0",
          "X-License-Key": licenseKey,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
       
        setIsOffline(data.offline_mode);
      } else {
        console.error("Помилка отримання інформації:", response.status);
      }
    } catch (error) {
      console.error("Помилка отримання інформації:", error);
    }
  };

  const handleLogin = async () => {
    setIsLoading(true);

    try {
      const response = await fetch("https://api.checkbox.ua/api/v1/cashier/signinPinCode", {
        method: "POST",
        headers: {
          "accept": "application/json",
          "X-Client-Name": "Integration",
          "X-Client-Version": "1.0",
          "X-License-Key": licenseKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ pin_code: pinCode }),
       
      });

      if (response.ok) {
        const data = await response.json();
        
        const accessToken = data.access_token;
        setCloseZ(true)
        setZreport(false)
        localStorage.setItem("access_token", accessToken);
        await openedShiftOrNotWithStart();
        
      } else {
        console.error("Помилка авторизації:", response.status);
        setLoginFail(true);
      }
    } catch (error) {
      console.error("Помилка авторизації:", error);
    }
    
    setIsLoading(false);
  };

  const checkTaxServiceConnection = async () => {
    try {
      const response = await fetch("https://api.checkbox.ua/api/v1/cash-registers/ping-tax-service", {
        method: "POST",
        headers: {
          "accept": "application/json",
          "X-Client-Name": "Integration",
          "X-Client-Version": "1.0",
         /*  "X-Access-Key": __license, */
          "X-License-Key": licenseKey,
          "Authorization": `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
       
        setTaxServiceStatus(data.status);
      } else {
        console.error("Помилка перевірки зв'язку з сервером ДПС:", response.status);
      }
    } catch (error) {
      console.error("Помилка перевірки зв'язку з сервером ДПС:", error);
    }
  };

  const openShift = async () => {
    let myuuid = uuidv4();
   
    
    try {
      const response = await fetch("https://api.checkbox.ua/api/v1/shifts", {
        method: "POST",
        headers: {
          "accept": "application/json",
          "X-Client-Name": "Integration",
          "X-Client-Version": "1.0",
          "X-License-Key": licenseKey,
          "Authorization": `Bearer ${localStorage.getItem("access_token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: myuuid }),
       
      });
  
      if (response.ok) {
        console.log("Зміна відкрита успішно");
        const responseBody = await response.json(); // Преобразование тела ответа в JSON
       
        setUserName(responseBody.cashier.full_name)
        setOpenStore("Зміна відкрита успішно");
        statusShift();
        checkTaxServiceConnection();
        setZreport(false);
        
  
        // Вызываем fetchCashRegisterInfo только после успешного открытия смены
        fetchCashRegisterInfo();
      } else {
        console.error("Помилка відкриття зміни:", response.status);
        
        setOpenStore(response.status);
      }
    } catch (error) {
      console.error("Помилка відкриття зміни:", error);
    }
  };

        // Юзаем для получения статуса и Баланса кассы. 
  const statusShift = async () => {
    try {
      const response = await fetch("https://api.checkbox.ua/api/v1/cashier/shift", {
       
        headers: {
          "accept": "application/json",
          "X-Client-Name": "Integration",
          "X-Client-Version": "1.0",
         /*  "X-License-Key": licenseKey, */
          "Authorization": `Bearer ${localStorage.getItem("access_token")}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const responseBody = await response.json(); // Преобразование тела ответа в JSON
      
        let responseBalance = (responseBody.balance.balance / 100);
        setBalanceUser(responseBalance);
       
      } else {
        console.error("Помилка:", response.status);
       
      }
    } catch (error) {
      console.error(error);
    }

    
  };

  
  // Код для закрытия смены и получения Z-отчета
  const closeShift = async () => {
    try {
      const response = await fetch("https://api.checkbox.ua/api/v1/shifts/close", {
        method: "POST",
        headers: {
          "accept": "application/json",
          "X-Client-Name": "Integration",
          "X-Client-Version": "1.0",
          "X-License-Key": licenseKey,
          "Authorization": `Bearer ${localStorage.getItem("access_token")}`,
          "Content-Type": "application/json",
        },
      });
    
      if (response.ok) {
        const data = await response.json();
        
      
        setZOutput(data);
        console.log("Зміна закрита успішно");
        setOpenStore("Зміна закрита успішно");
        setIsOffline(true); // Установите состояние isOffline в true
        setTaxServiceStatus(null);
        setBalanceUser(null);
        setUserName(null);
        setZreport(true);
       
      } else {
        console.error("Помилка закриття зміни:", response.status);
        setOpenStore(response.status);
      }
    } catch (error) {
      console.error("Помилка закриття зміни:", error);
    }
  };
 


  // Конец кода для закрытия смены и получения Z-отчета

  
 // Метод генерации ID товара
  const randomID = () => {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const randomIndexFirst = Math.floor(Math.random() * alphabet.length);
    const randomIndexSecond = Math.floor(Math.random() * alphabet.length);
    
    return `${alphabet[randomIndexFirst]}${alphabet[randomIndexSecond]}`;
  }
  // Конец метода


  // Код по созданию чеков с текстАреа
  const createReceiptAndFetchHtml = async (data) => {

   let defaultPayMethod = "CASH";
   if (data.paymentMethod === "Безготівка" || data.paymentMethod === "Післяплата") {
    defaultPayMethod = "CASHLESS";
   } 
   

   let sumCheck = data.productQuantity * (parseFloat(data.productPrice) * 100); 
    const receiptData = {
      id: uuidv4(),
      goods: [
        {
          good: {
            code: (randomID() + Math.random() * 1000), // Лютый костыль
            name: data.productName,
            price: parseFloat(data.productPrice) * 100,
          },
          good_id: uuidv4(),
          quantity: data.productQuantity * 1000,
          is_return: false,
        },
      ],
      payments: [
        {
          type: defaultPayMethod,
          value: sumCheck,
          label: data.paymentMethod
        },
      ],
    };
   
  
    try {
      setCreatingLink(true); // Устанавливаем состояние загрузки

      const responseCreate = await fetch("https://api.checkbox.ua/api/v1/receipts/sell", {
        method: "POST",
        headers: {
          "accept": "application/json",
          "X-Client-Name": "Integration",
          "X-Client-Version": "1.0",
          "X-License-Key": licenseKey,
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify(receiptData),
      });
  
      if (responseCreate.ok) {
        console.log("Чек успешно создан");
        const responseBody = await responseCreate.json();
        const receiptId = responseBody.id;
      
  
        let urlCheck = (`https://api.checkbox.ua/api/v1/receipts/${receiptId}/html`);
        console.log(`https://api.checkbox.ua/api/v1/receipts/${receiptId}/html`) // <-- Ссылка на чек
        setUrlCheck((prevUrlCheck) => [...prevUrlCheck, urlCheck]);
  
       

      } else {
        console.error("Ошибка при создании чека:", responseCreate.status);
       
      }
    } catch (error) {
      console.error("Ошибка при создании чека:", error);
    }
    statusShift();
  };

  // Конец кода по созданию чеков с текстАреа
  
  const [inputData, setInputData] = useState('');
  const [parsedData, setParsedData] = useState([]);

  const handleInputChange = (event) => {
    setInputData(event.target.value);
  };


   const parseData = () => {
    const lines = inputData.split('\n');

    const paymentMethodMapping = {
      "Наложка": "Готівка",
      "налож": "Готівка",
      "готівка": "Готівка",
      "Накладний": "Готівка",
      "Наложка р/р": "Післяплата",
      "Контроль оплаты": "Післяплата",
      "На карту": "Безготівка",
      "картка": "Безготівка",
      "Карточка": "Безготівка",
      "на карту банка": "Безготівка",
      "контр": "Післяплата"
      // Добавьте другие способы оплаты и их значения
    };

   
    const parsedData = lines.map((line) => {
    const [product, paymentMethod, price] = line.split('\t');
   
    const cleanedPaymentMethod = paymentMethodMapping[paymentMethod] || paymentMethod;
    
    return { product, paymentMethod: cleanedPaymentMethod, price };
  });
  
  setParsedData(parsedData);
};

  const copyAllLinks = () => {
    const allLinks = urlCheck.join("\n"); // Объединяем ссылки в одну строку с разделителем
    clipboardCopy(allLinks); // Копируем строку с ссылками в буфер обмена
    console.log("Все ссылки скопированы");
  };


  const createAllReceiptsAndFetchHtml = async () => {
    for (const [index, data] of parsedData.entries()) {
    
  
      await createReceiptAndFetchHtml({
        productName: data.product,
        productPrice: data.price,
        productQuantity: parseFloat(productQuantities[index]) || defaultProductQuantity,
        paymentMethod: data.cleanedPaymentMethod,
        paymentMethod: data.paymentMethod, // Передаем тип оплаты
      });
  
      if (index < parsedData.length - 1) {
        // Пауза в 5 секунд между запросами, кроме последнего запроса
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    }
    statusShift();
  };

   
 // Обработчик изменения данных товара
const handleProductChange = (index, field, value) => {
  const updatedProducts = [...products];
  updatedProducts[index][field] = value;
  setProducts(updatedProducts);
};

// Добавление нового товара
const addNewProduct = () => {
  setProducts([...products, { name: '', quantity: '', price: '' }]);
};

// Удаление товара
const removeProduct = (index) => {
  const updatedProducts = [...products];
  updatedProducts.splice(index, 1);
  setProducts(updatedProducts);
};

// Создание чека на основе данных из формы
const createReceiptFromForm = async () => {
  try {
    let defaultPayMethod = "CASH"; // Значение по умолчанию для способа оплаты
    if (paymentMethod === "Післяплата" || paymentMethod === "Безготівка") {
      defaultPayMethod = "CASHLESS";
    }

   

    const goods = products.map((product) => ({
      good: {
        code: "FD-" + Math.random() * 1000,
        name: product.name,
        price: parseFloat(product.price) * 100,
      },
      good_id: uuidv4(),
      quantity: product.quantity * 1000,
      is_return: false,
    }));

    const totalAmount = goods.reduce((total, product) => total + product.good.price * product.quantity / 1000, 0);



    const receiptData = {
      id: uuidv4(),
/*       cashier_name: "Имя кассира",
      departament: "Имя департамента", */
      goods: goods,
      payments: [
        {
          type: defaultPayMethod,
          value: totalAmount,
          label: paymentMethod
        },
      ],
    };

    const response = await fetch("https://api.checkbox.ua/api/v1/receipts/sell", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "X-Client-Name": "Integration",
        "X-Client-Version": "1.0",
        "X-License-Key": licenseKey,
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("access_token")}`,
      },
      body: JSON.stringify(receiptData),
    });

    if (response.ok) {
      console.log("Чек успешно создан");
      const responseBody = await response.json();
      const receiptId = responseBody.id;
     

      const urlCheck = `https://api.checkbox.ua/api/v1/receipts/${receiptId}/html`;
        
        /* setUrlCheck((prevUrlCheck) => [...prevUrlCheck, urlCheck]); */
        setOneCheckUrl(urlCheck);
        statusShift();

      } else {
        console.error("Ошибка при создании чека:", response.status);
    }
  } catch (error) {
    console.error("Ошибка при создании чека:", error);
  }
};

  const clearDataFromForm = () => {
    setOneCheckUrl(null);
    setProducts([{ name: '', quantity: '', price: '' }]);

  }

  const clearData = () => {
    setParsedData([]);
    setUrlCheck([]);
    setProductQuantities([]);
  }

  // Код для получения, записи и редактирования баланса 
  const paymentBalance = async (inputValue) => {
    try {
      const response = await fetch("https://api.checkbox.ua/api/v1/receipts/service", {
       method: "POST",
        headers: {
          "accept": "application/json",
          "X-Client-Name": "Integration",
          "X-Client-Version": "1.0",
         /*  "X-License-Key": licenseKey, */
          "Authorization": `Bearer ${localStorage.getItem("access_token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          payment: {
            type: "CASH",
            value: inputValue,
            label: "Готівка"
          }
        }),
      });
     

      if (response.ok) {
        const responseBody = await response.json(); // Преобразование тела ответа в JSON
        console.log(responseBody); // Вывод JSON-тела ответа в консоль
       
        statusShift()
      } else {
        console.error("Помилка:", response.status);
      }
    } catch (error) {
      console.error(error);
    } 
  };

  const handleDepositChange = (event) => {
    setDepositAmount(event.target.value);
  };

  const handleWithdrawChange = (event) => {
    setWithdrawAmount(event.target.value);
  };

  const handleDepositSubmit = () => {
    if (depositAmount !== "") {
      paymentBalance(parseFloat(depositAmount) * 100);
      setDepositAmount("");
    }
  };

  const handleWithdrawSubmit = () => {
    if (withdrawAmount !== "") {
      paymentBalance(-(parseFloat(withdrawAmount) * 100));
      setWithdrawAmount("");
    }
  };
  // Конец



   // Хендлы на кнопки в инпутах
  const handlePaymentMethodChange = (index, newValue) => {
    const newParsedData = [...parsedData];
    newParsedData[index].paymentMethod = newValue;
    setParsedData(newParsedData);
  };

  const handlePriceChange = (index, newValue) => {
    const newParsedData = [...parsedData];
    newParsedData[index].price = newValue;
    setParsedData(newParsedData);
  };
  // Конец

  // Разлогин
  const handleSignout = async () => {
    closeShift()
    setCloseZ(false)
   /*  setLicenseKey("")
    setPinCode("") */
    try {
      const response = await fetch(
        "https://api.checkbox.ua/api/v1/cashier/signout",
        {
          method: "POST",
          headers: {
            "accept": "application/json",
            "X-Client-Name": "Integration",
            "X-Client-Version": "1.0",
            "Authorization": `Bearer ${localStorage.getItem("access_token")}`,
          },
         
        }
      );
  
      if (response.status === 205) {
       
        
        
        localStorage.removeItem("access_token");
        // Дополнительные действия после завершения сессии
      } else {
        console.error("Ошибка завершения сеанса:", response.status);
      }
    } catch (error) {
      console.error("Ошибка завершения сеанса:", error);
    }
  };


  // Метод проверки пустых инпутов заказов в массиве

  const hasEmptyInputs = () => {
    return parsedData.some(data => data.product === "" || data.price === "");
  };

  // конец метода
  
 // Получаем имя юзера
  const getCashierProfile = async () => {
    try {
      const response = await fetch("https://api.checkbox.ua/api/v1/cashier/me", {
       method: "GET",
        headers: {
          "accept": "application/json",
          "X-Client-Name": "Integration",
          "X-Client-Version": "1.0",
          "X-License-Key": licenseKey, 
           "Authorization": `Bearer ${localStorage.getItem("access_token")}`,
          "Content-Type": "application/json",
          "X-Device-ID": "1"
        },
      });

      if (response.ok) {
        const responseBody = await response.json(); // Преобразование тела ответа в JSON
        console.log(responseBody)
        console.log(responseBody.full_name)
       setUserName(responseBody.full_name)
       
      } else {
        console.error("Помилка отримання ПІБ:", response.status);
       
      }
    } catch (error) {
      console.error(error);
    }

    
  };

  // Метод проверки авторизации кассира при старте
  const openedShiftOrNotWithStart = async () => {
    try {
      const response = await fetch("https://api.checkbox.ua/api/v1/cashier/shift", {
       
        headers: {
          "accept": "application/json",
          "X-Client-Name": "Integration",
          "X-Client-Version": "1.0",
         /*  "X-License-Key": licenseKey, */
          "Authorization": `Bearer ${localStorage.getItem("access_token")}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const responseBody = await response.json(); // Преобразование тела ответа в JSON
        console.log(responseBody)
        console.log(responseBody.cash_register.active)
        if (responseBody === null) {setHasStatusShift(responseBody.cash_register.active)} 
        
       
       /*  setUserName(responseBody.cashier.full_name) */
        setOpenStore("Зміна відкрита успішно");
        statusShift();
        checkTaxServiceConnection();
        setZreport(false);
        await fetchCashRegisterInfo();
        await getCashierProfile();
        

       
      } else {
        console.error("Помилка:", response.status);
       
      }
    } catch (error) {
      console.error(error);
    }

    
  };

  

  
  return (
    <CustomDiv>
        {!closeZ ? (
          <div style={{width: "auto"}}>
            <CustomDiv style={{marginTop: "30px", marginBottom: "-30px"}}> 
                  <Typography variant="h5" component="h2">Авторизація через CheckBox</Typography>  
            </CustomDiv>
            
            <LoginDiv >    
                
                <TextField
                    style={{marginRight: "5px"}}
                    label="PIN-код касира"
                    variant="outlined"
                    color="success"
                    size="small"
                    type="text"
                    value={pinCode}
                    onChange={(e) => {
                    setPinCode(e.target.value);
                    }}
                />

                <TextField
                    label="Ключ ліцензії каси"
                    variant="outlined"
                    color="success"
                    size="small"
                    type="text"
                    value={licenseKey}
                    onChange={(e) => {
                    setLicenseKey(e.target.value);
                    }}
                />
                
                <Button variant="contained" color="primary" size="small" style={{ fontSize: 12, margin: 5 }}   onClick={handleLogin} disabled={isLoading}>
                      {isLoading ? "Завантаження..." : "Увійти"}
                </Button><br/>
               
            </LoginDiv>
            
            <div style={{ marginTop: '10px', margin: '0 auto', textAlign: 'center',  }}>
            <div style={{ display: 'flex', justifyContent: 'center', margin: "5px",  }}>
              {loginFail ? <Alert severity="warning">Помилка авторизації</Alert> : null}</div>
            </div>
           
             <CustomDiv>
                       <PrevPage/>
             </CustomDiv>
            
          </div>
        ): null}
                
               
     




    {closeZ ? (
                 
                      <CustomDiv style={{marginTop: "5px"}}>
                      <div>
                          {/*   <button onClick={checkTaxServiceConnection}>Перевірити зв'язок з сервером ДПС</button><br/> */}
                          <Button disabled={!isOffline} onClick={openShift}>Відкрити зміну</Button>
                          <Button disabled={isOffline} onClick={closeShift}>Закрити зміну</Button> 
                          

                          <Button variant="outlined" color="error" size="small" style={{ fontSize: 12 }} onClick={handleSignout}>Вийти</Button>
                           
                      </div>
                 
                      <Grid style={{ display: 'flex', alignItems: "flex-end"}}>
                      <BalanceDiv >
                            <Typography variant="h6" mt={2}  >Інфо-панель</Typography>
                            <BalanceInDiv>
                            <Paper style={{width: "auto", height: "auto", display: "flex"}} elevation={2} >
                           
                           <StatusInfoDiv style={{ flex: 1, marginRight: '100px' }}>
                                   <Typography variant="BUTTON TEXT">
                                   Ім'я кассира: {userName === null ? "Невідомий" : userName}
                                   </Typography>
                                   <Typography variant="BUTTON TEXT">
                                   Зв'язок з сервером ДПС: {taxServiceStatus === null ? "Невідомий" : taxServiceStatus}
                                   </Typography>
                                   <Typography variant="BUTTON TEXT" >
                                   Поточний режим: <b style={{color: isOffline ? "#ec1010" : "green"}}>{isOffline === null ? "Каса не відкрита" : isOffline ? "Офлайн" : "Онлайн"}</b>
                                   </Typography>
                                   <Typography variant="BUTTON TEXT">
                                   Статус зміни: {openStore === null ? "Невідомий" : openStore}
                                   </Typography>       
                           </StatusInfoDiv>
                    
                             </Paper>
                            </BalanceInDiv>
                            </BalanceDiv>      
                            <BalanceDiv >
                              <Typography variant="h6" style={{margin: "2px", marginTop: "20px"}}>Баланс каси: {balanceUser}</Typography>
                           
                              <BalanceInDiv>
                              <TextField
                                  label="Сума для внесення"
                                  variant="outlined"
                                  color="success"
                                  style={{marginRight: 5, height: "38px"}}
                                  size="small"
                                  type="number"
                                  value={depositAmount}
                                  onChange={handleDepositChange}
                                />
                                <Button variant="contained" color="success" size="small" onClick={handleDepositSubmit}>Внести готівку</Button>
                              </BalanceInDiv>
                              <BalanceInDiv>
                              <TextField
                                  label="Сума для видачі"
                                  variant="outlined"
                                  color="error"
                                  style={{marginRight: 5, height: "38px"}}
                                  size="small"
                                  type="number"
                                /*   placeholder="Сума для видачі" */
                                  value={withdrawAmount}
                                  onChange={handleWithdrawChange}
                                />
                                <Button  variant="contained" color="error" style={{"opacity": 0.8}} size="small" onClick={handleWithdrawSubmit}>Видати готівку</Button>
                              </BalanceInDiv>
                            </BalanceDiv>
                      </Grid>
      
            <CustomDiv style={{marginTop: "20px"}}>
               <PopupButton/>
            </CustomDiv>
        
      <Accordion style={{marginBottom: "20px", marginTop: "30px"}}>
        <AccordionSummary>
        <Button variant="contained" style={{textAlign: "center", backgroundColor: "#51c560"}}><ArrowCircleDownIcon fontSize="small"/> Створення одного чеку</Button>
 
        </AccordionSummary>
        <AccordionDetails>
        <div>
          
        <Divider style={{display: "flex", flexWrap: "wrap"}}>
            <Select size="small"  value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                  <MenuItem value="Безготівка">Безготівка</MenuItem>
                  <MenuItem value="Післяплата">Післяплата</MenuItem>
                  <MenuItem value="Готівка">Готівка</MenuItem>
           </Select>
       </Divider>
      {products.map((product, index) => (
        <Grid style={{margin: "2px"}} container spacing={1} key={index}>
          <Grid item xs={8}>
            <TextField
              label="Название товара"
              value={product.name}
              onChange={(e) =>
                handleProductChange(index, 'name', e.target.value)
              }
              variant="outlined"
              fullWidth
            />
          </Grid>
          <Grid item xs={1}>
            <TextField
              label="К"
              type="number"
              value={product.quantity}
              onChange={(e) =>
                handleProductChange(index, 'quantity', e.target.value)
              }
              variant="outlined"
              fullWidth
            />
          </Grid>
          <Grid item xs={1}>
            <TextField
              label="Цена"
             
              value={product.price}
              onChange={(e) =>
                handleProductChange(index, 'price', e.target.value)
              }
              variant="outlined"
              fullWidth
            />
          </Grid>
          <Grid item xs={1}>
            <TextField
              disabled
              label={product.price < 1 ? "" : "Сумма"}
              value={product.price > 1 ? (product.price * product.quantity) : "Сумма"}
              readOnly
              variant="outlined"
              fullWidth
              
            />
          </Grid>
          <Grid item xs={1}>
            <Button variant="contained" color="success" size="small" style={{height: 22}} onClick={addNewProduct}>+</Button>
            <Button disabled={products.length <= 1} variant="contained" color="error" size="small" style={{height: 22}}  onClick={() => removeProduct(index)}>-</Button>
          </Grid>
        </Grid>
      ))}
       <Stack style={{flexDirection: "column", alignItems: "center", marginTop: "5px"}} direction="row" spacing={1}>
             <Grid> 
                <Button disabled={!hasStatusShift && isOffline || products[0].name.length < 1 } variant="outlined" color="success" size="small" onClick={createReceiptFromForm}>Створити один чек</Button>
                <Button variant="outlined" style={{margin: "5px"}} color="error" size="small" onClick={clearDataFromForm}>Видалити дані</Button>
            </Grid>
       </Stack>
        <CustomDiv style={{margin: "5px"}}>
          <a href={oneCheckUrl}>{oneCheckUrl}</a>
        </CustomDiv>
      </div>
        </AccordionDetails>
      </Accordion>
      
            <CustomDiv>
            <Typography variant="h6" style={{textAlign: "center"}}>Масове створення чеків:</Typography>
             <TextareaAutosize
              style={{height: "auto"}}
              rows="6"
              cols="110"
              placeholder="Вставте неопрацьовані дані в це поле в наступному порядку: Назва товару => Споcіб оплати => Ціна товару"
              value={inputData}
              onChange={handleInputChange}
            />
            <br/>
           <div style={{display: "flex", width: "100%", marginBottom: "5px", justifyContent: "center"}}> 
           
           </div>
            </CustomDiv>
           
            <CustomDiv>
             
              <div style={{display: "flex", alignItems: "baseline"}}> 
                        <Button variant="contained" style={{backgroundColor: "#117cb4", margin: "5px"}} onClick={parseData}>Парсити дані</Button>
                        <Button variant="contained" style={{backgroundColor: "#cb4747", marginRight: "50px"}} onClick={clearData}>Видалити дані</Button>
                        <Button disabled={isOffline || parsedData.length < 1 || hasEmptyInputs()} variant="contained" color="success" style={{margin: "5px"}} onClick={createAllReceiptsAndFetchHtml}>Створити всі чеки</Button>
                        <Button variant="contained" style={{backgroundColor: "rgb(33 149 183)", margin: "2px"}} onClick={copyAllLinks}>Копіювати всі посилання</Button> 
              </div>
            
                 
              {zreport ? (
                <CustomDiv>
                    
                <Paper style={{width: "400px", height: "auto", margin: "30px"}} elevation={8} >
                   <div>
                    <Typography variant="h6" align="center">
                    Z-звіт
                    </Typography>
                    <Typography align="center">
                    =========================================
                    </Typography>
                    <Typography align="center">
                    --------------- Баланс ---------------
                    </Typography>
                    <Typography style={{margin: "4px", fontSize: "12px"}}>
                      Баланс на момент відкриття зміни: <span style={{ float: 'right', marginRight: "4px" }}>{zOutput.balance.initial / 100}.00</span>
                    </Typography>
                    <Typography style={{margin: "4px", fontSize: "12px"}}>
                      Баланс на момент закриття зміни: <span style={{ float: 'right', marginRight: "4px"  }}>{zOutput.balance.balance / 100}.00</span>
                    </Typography>
                   
                    <Typography align="center">
                    ------------- Повернення  --------------
                    </Typography>
                    <Typography style={{margin: "4px", fontSize: "12px"}}>
                      Сума готівкових повернень: <span style={{ float: 'right', marginRight: "4px"  }}>{zOutput.balance.cash_returns / 100}.00</span>
                    </Typography>
                    <Typography style={{margin: "4px", fontSize: "12px"}}>
                      Сума безготівкових повернень: <span style={{ float: 'right', marginRight: "4px"  }}>{zOutput.balance.card_returns / 100}.00</span>
                    </Typography>
                    <Typography align="center">
                    --------------- Внесення  ---------------
                    </Typography>
                    <Typography style={{margin: "4px", fontSize: "12px"}}>
                      Сума службових внесень готівкових: <span style={{ float: 'right', marginRight: "4px"  }}>{zOutput.balance.service_in / 100}.00</span>
                    </Typography>
                    <Typography style={{margin: "4px", fontSize: "12px"}}>
                      Сума службових вилучень готівкових: <span style={{ float: 'right', marginRight: "4px"  }}>{zOutput.balance.service_out / 100}.00</span>
                    </Typography>
                    <Typography align="center">
                    ---------------- Виручка ----------------
                    </Typography>
                    <Typography style={{margin: "4px", fontSize: "12px"}}>
                      Сума готівкових продажів: <span style={{ float: 'right', marginRight: "4px"  }}>{zOutput.balance.cash_sales / 100}.00</span>
                    </Typography>
                    <Typography style={{margin: "4px", fontSize: "12px"}}>
                      Сума безготівкових продажів: <span style={{ float: 'right', marginRight: "4px"  }}>{zOutput.balance.card_sales / 100}.00</span>
                    </Typography>
                    <Typography style={{margin: "4px", fontSize: "12px"}}>
                     Всього: <span style={{ float: 'right', marginRight: "4px"  }}>{(zOutput.balance.card_sales +zOutput.balance.cash_sales)/100}.00</span>
                    </Typography>
                    <Typography style={{margin: "4px", fontSize: "12px"}}>
                      Кількість створених чеків: <span style={{ float: 'right', marginRight: "4px"  }}>{zOutput.z_report.sell_receipts_count}</span>
                    </Typography>
                    <Typography align="center">
                    =========================================
                    </Typography>
                   </div>
              </Paper>
           </CustomDiv>
              ): null}
              
              <CustomDiv style={{marginBottom: "50px"}}>
                {hasEmptyInputs() ? ( <Alert severity="error" style={{marginTop: "25px"}}>Щось пішло не так. Заповніть всі поля та спробуйте ще раз.</Alert>) : null}
             {!parsedData.length < 1 ? ( <h2>Всі замовлення для створення чеків:</h2>): null}
              {parsedData.map((data, index) => (
               <Grid style={{margin: "1px auto", justifyContent: "center"}} container spacing={1} key={index}>
               <Grid item xs={4}>
                 <TextField
                     
                      variant="outlined"
                      fullWidth 
                      size="small" 
                      type="text"
                      value={data.product}
                      onChange={(e) => {
                        const newParsedData = [...parsedData];
                        newParsedData[index].product = e.target.value;
                        setParsedData(newParsedData);
                  }}
                />
                </Grid>
                <Grid item xs={0}>
                 <Select
                  size="small"
                  style={{ "minWidth": "150px" }} 
                  value={data.paymentMethod}
                  onChange={(e) => handlePaymentMethodChange(index, e.target.value)}
                >
                  <MenuItem   value="Готівка">Готівка</MenuItem>
                  <MenuItem value="Післяплата">Післяплата</MenuItem>
                  <MenuItem value="Безготівка">Безготівка</MenuItem>
                </Select>
                </Grid>
                <Grid item xs={1}>
                <TextField
                  variant="outlined" 
                  fullWidth
                  size="small" 
                  type="text"
                  value={data.price}
                  onChange={(e) => handlePriceChange(index, e.target.value)}
                />
                </Grid>
                <Grid item xs={1}>
                  <TextField 
                    variant="outlined" 
                    fullWidth
                    size="small"
                    type="number"
                    value={productQuantities[index] || defaultProductQuantity}
                    onChange={(e) => {
                      const newQuantities = [...productQuantities];
                      newQuantities[index] = e.target.value;
                      setProductQuantities(newQuantities);
                    }}
                  />
                </Grid>
                <Grid item xs={1}>
                  <TextField variant="outlined" fullWidth size="small"  type="text" value={data.price * productQuantities[index] || data.price} readOnly/> 
                  </Grid>
              
                  <Grid item xs={1} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {urlCheck[index] && (
                        <a href={urlCheck[index]}>Посилання на чек</a>
                      )}
                         {!urlCheck[index] && urlCheck[index - 1] ? (<CircularProgress />) : null}
                </Grid>

                </Grid>
             
              ))}
                </CustomDiv>
              </CustomDiv>
            </CustomDiv>
            
    ): null}
    </CustomDiv>
  );
};

export default MainComponent;
