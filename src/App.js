import React, { useState, useEffect } from "react";
import {v4 as uuidv4} from 'uuid';
import clipboardCopy from 'clipboard-copy';


const __pincode = "4570591973";
const __license = "test923cd627e08fa7f2cf78a528";




const Checkbox = () => {
  const [pinCode, setPinCode] = useState("");
  const [licenseKey, setLicenseKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOffline, setIsOffline] = useState(true);
  const [taxServiceStatus, setTaxServiceStatus] = useState(null);
  const [openStore, setOpenStore] = useState(null);
  const [inputFilled, setInputFilled] = useState(false);
  const [urlCheck, setUrlCheck] = useState([]);
 

  const defaultProductQuantity = 1;
 
  const [productQuantities, setProductQuantities] = useState([]);

 


  const fetchCashRegisterInfo = async () => {
    try {
      const response = await fetch("https://api.checkbox.ua/api/v1/cash-registers/info", {
        headers: {
          accept: "application/json",
          "X-Client-Name": "Integration",
          "X-Client-Version": "1.0",
          "X-License-Key": __license,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data);
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
        console.log(data);
        const accessToken = data.access_token;
        localStorage.setItem("access_token", accessToken);
        console.log(accessToken);
        
      } else {
        console.error("Помилка авторизації:", response.status);
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
        console.log(data);
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
    console.log(myuuid);
    
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
        setOpenStore("Зміна відкрита успішно");
  
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
        console.log("Зміна закрита успішно");
        setOpenStore("Зміна закрита успішно");
        setIsOffline(true); // Установите состояние isOffline в true
        setTaxServiceStatus(null);
        localStorage.removeItem("access_token");
      } else {
        console.error("Помилка закриття зміни:", response.status);
        setOpenStore(response.status);
      }
    } catch (error) {
      console.error("Помилка закриття зміни:", error);
    }
  };
 
  console.log(isOffline);

  


  const [productCode, setProductCode] = useState("");
  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productQuantity, setProductQuantity] = useState("");
  const [paymentType, setPaymentType] = useState("");
  const [totalAmount, setTotalAmount] = useState("");

  

  const createReceiptAndFetchHtml = async (data) => {

   let defaultPayMethod = "CASH";
   if (data.paymentMethod === "Картка") {
    defaultPayMethod = "CASHLESS";
   } // Ебурим способ

   let sumCheck = data.productQuantity * (parseFloat(data.productPrice) * 100); // хуй знает как тут блять копейки в количество ушло верно
    const receiptData = {
      id: uuidv4(),
      cashier_name: "Имя кассира",
      departament: "Имя департамента",
      goods: [
        {
          good: {
            code: ("FD-" + Math.random() * 1000), // Лютый костыль
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
        },
      ],
    };
   
  
    try {
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
        console.log(receiptId);
  
        const responseHtml = await fetch(`https://api.checkbox.ua/api/v1/receipts/${receiptId}/html`, {
          method: "GET",
          headers: {
            "accept": "text/html",
            "X-Client-Name": "My Custom SDK", // Замените на название вашего клиента
            "X-Client-Version": "v1.0", // Замените на версию вашего клиента
            "X-License-Key": licenseKey,
          },
        });
  
        if (responseHtml.ok) {
          const htmlContent = await responseHtml.text();
          let urlCheck = (`https://api.checkbox.ua/api/v1/receipts/${receiptId}/html`);
           console.log(`https://api.checkbox.ua/api/v1/receipts/${receiptId}/html`) // <-- Ссылка на чек
           setUrlCheck((prevUrlCheck) => [...prevUrlCheck, urlCheck]);
          
          // Здесь вы можете использовать htmlContent
          /* console.log (htmlContent) */
        } else {
          console.error("Ошибка получения HTML чека:", responseHtml.status);
        }
      } else {
        console.error("Ошибка при создании чека:", responseCreate.status);
        console.log(responseCreate);
      }
    } catch (error) {
      console.error("Ошибка при создании чека:", error);
    }
  };
  
  const [inputData, setInputData] = useState('');
  const [parsedData, setParsedData] = useState([]);

  const handleInputChange = (event) => {
    setInputData(event.target.value);
  };


   const parseData = () => {
    const lines = inputData.split('\n');
    const parsedData = lines.map((line) => {
      const [product, paymentMethod, price] = line.split('\t');
     
      let cleanedPaymentMethod = paymentMethod;

      // Проверяем наличие подстрок и заменяем значения
      if (paymentMethod.includes("Налож")) {
        cleanedPaymentMethod = "Готівка";
      } else if (paymentMethod.includes("На карту")) {
        cleanedPaymentMethod = "Картка";
      }
      
      return { product, paymentMethod: cleanedPaymentMethod, price };
    });
    setParsedData(parsedData);
   
    console.log(inputData)
    console.log(parsedData)
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
  };
 

  const clearData = () => {
    setParsedData([]);
    setUrlCheck([]);
    setProductQuantities([]);
  }

  
 
  return (
    <div>
      <div>
        Поточний режим: {isOffline === null ? "Каса не відкрита" : isOffline ? "офлайн" : "онлайн"}
      </div>
      <div>
        Статус зв'язку з сервером ДПС: {taxServiceStatus === null ? "невідомий" : taxServiceStatus}
      </div>
      <div>
        Статус зміни: {openStore === null ? "невідомий" : openStore}
      </div>
      <br />
      <input
        type="text"
        placeholder="PIN-код касира"
        value={pinCode}
        onChange={(e) => {
          setPinCode(e.target.value);
          setInputFilled(!!e.target.value); // Устанавливаем состояние inputFilled в зависимости от ввода
        }}
      />
      <input
        type="text"
        placeholder="Ключ ліцензії каси"
        value={licenseKey}
        onChange={(e) => {
          setLicenseKey(e.target.value);
          setInputFilled(!!e.target.value); // Устанавливаем состояние inputFilled в зависимости от ввода
        }}
      />
      <button onClick={handleLogin} disabled={isLoading}>
        {isLoading ? "Завантаження..." : "Увійти"}
      </button><br/>
      <button onClick={checkTaxServiceConnection}>Перевірити зв'язок з сервером ДПС</button><br/>
      <button onClick={openShift}>Відкрити зміну</button>
      <button onClick={closeShift}>Закрити зміну</button>
      <br/>


      <div>
       <textarea
        rows="6"
        cols="50"
        placeholder="Вставьте данные сюда..."
        value={inputData}
        onChange={handleInputChange}
      />
      <button onClick={parseData}>Парсить данные</button>
      </div>
      <div>
        <button onClick={createAllReceiptsAndFetchHtml}>Создать все чеки</button>
        <button onClick={clearData}>Clear Data</button>
        <button onClick={copyAllLinks}>Копировать все ссылки</button>
        <h2>Инпуты на основе массива:</h2>
        {parsedData.map((data, index) => (
          <div key={index}>
            <input type="text" value={data.product} readOnly />
            <input type="text" value={data.paymentMethod} readOnly />
            <input type="text" value={data.price} readOnly />
            <input
              type="number"
              value={productQuantities[index] || defaultProductQuantity}
              onChange={(e) => {
                const newQuantities = [...productQuantities];
                newQuantities[index] = e.target.value;
                setProductQuantities(newQuantities);
              }}
            />
           {/*  <button onClick={() => createReceiptAndFetchHtml({
              productName: data.product,
              productPrice: data.price,
              productQuantity: parseFloat(productQuantities[index]) || defaultProductQuantity,
            })}>
              Создать чек
            </button> */}
            {urlCheck[index] && ( // Проверяем, есть ли ссылка на чек для данного индекса
              <a href={urlCheck[index]}>Ссылка на чек</a>
            )}
          </div>
        ))}
      </div>
      {/* <div>
        <button onClick={copyAllLinks}>Копировать все ссылки</button>
        {urlCheck.map((check, index) => (
          <div key={index}>
            <a href={check}>Check #{index}</a>
          </div>
        ))}
      </div> */}
      {/*  <div>
        <input
          placeholder="Код товара"
          value={productCode}
          onChange={(e) => setProductCode(e.target.value)}
        />
        <input
          placeholder="Название товара"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
        />
        <input
          placeholder="Цена товара"
          value={productPrice}
          onChange={(e) => setProductPrice(e.target.value)}
        />
        <input
          placeholder="Количество"
          value={productQuantity}
          onChange={(e) => setProductQuantity(e.target.value)}
        />
        <input
          placeholder="Тип оплаты"
          value={paymentType}
          onChange={(e) => setPaymentType(e.target.value)}
        />
        <input
          placeholder="Сумма"
          value={totalAmount}
          onChange={(e) => setTotalAmount(e.target.value)}
        />
        <button onClick={createReceiptAndFetchHtml}>Создать чек</button>
      </div>  */}
     
    </div>
  );
};

export default Checkbox;
