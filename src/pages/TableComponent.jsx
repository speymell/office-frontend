import React, { useEffect, useState } from "react";
import axios from "../axios";
import styles from "./TableComponent.css";
import { logout, selectIsAuth } from "../redux/slices/auth";
import { useDispatch, useSelector } from "react-redux";
import styles2 from "../components/Work/Work.css";
import { Navigate } from "react-router-dom";
import logoutIcon from "./logout.svg";
import ExcelJS from "exceljs";

const TableComponent = () => {
  const [taskData, setTaskData] = useState([]);
  const isAuth = useSelector(selectIsAuth);
  const [notification, setNotification] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);

  const status = useSelector((state) => state.auth.status);
  const [data, setData] = useState({
    headers: [],
    rows: [],
  });

  const [selectedDateFrom, setSelectedDateFrom] = useState("");
  const [selectedDateTo, setSelectedDateTo] = useState("");

  const handleDateFromChange = (event) => {
    setSelectedDateFrom(event.target.value);
  };

  const handleDateToChange = (event) => {
    setSelectedDateTo(event.target.value);
  };

  const dispatch = useDispatch();

  const login = window.localStorage.getItem("userWork");

  const exportToExcelWithSelectedDates = async () => {
    if (!selectedDateFrom || !selectedDateTo) {
      alert("Пожалуйста, выберите даты");
      return;
    }

    const startDate = selectedDateFrom.split("-").reverse().join(".");
    const endDate = selectedDateTo.split("-").reverse().join(".");

    try {
      const response = await axios.post("/plan/latest/selecteddate", {
        startDate,
        endDate,
      });

      const data = response.data;
      const dayData = [];
      const nightData = [];

      data.forEach((item) => {
        if (item.type === "day") {
          dayData.push(item);
        } else if (item.type === "night") {
          nightData.push(item);
        }
      });

      // Сортировка данных по дате
      dayData.sort((a, b) => {
        const dateA = new Date(a.date.split(".").reverse().join("-"));
        const dateB = new Date(b.date.split(".").reverse().join("-"));
        return dateA - dateB;
      });
      nightData.sort((a, b) => {
        const dateA = new Date(a.date.split(".").reverse().join("-"));
        const dateB = new Date(b.date.split(".").reverse().join("-"));
        return dateA - dateB;
      });

      createExcelFile(dayData, nightData);
    } catch (error) {
      console.error(error);
    }
  };

  const createExcelFile = (dayData, nightData) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Расписание");

    // Добавление заголовков
    worksheet.addRow(["", ...dayData.map((item) => item.date)]);

    // Добавление смены "День"
    const dayCell = worksheet.getCell("A2");
    dayCell.value = "День";
    dayCell.font = { bold: true };
    for (let i = 0; i < 7; i++) {
      const row = [];
      row.push(`Работник ${i + 1}`);
      dayData.forEach((item) => {
        row.push(item.logins[i] || "");
      });
      worksheet.addRow(row);
    }

    // Добавление смены "Ночь"
    const nightCell = worksheet.getCell(`A${worksheet.rowCount + 1}`);
    nightCell.value = "Ночь";
    nightCell.font = { bold: true };
    for (let i = 0; i < 3; i++) {
      const row = [];
      row.push(`Работник ${i + 1}`);
      nightData.forEach((item) => {
        row.push(item.logins[i] || "");
      });
      worksheet.addRow(row);
    }

    // Экспорт файла
    workbook.xlsx
      .writeBuffer()
      .then((buffer) => {
        const blob = new Blob([buffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        const firstDate = dayData[0].date.split("-").reverse().join(".");
        a.href = url;
        a.download = `РасписаниеС${selectedDateFrom}.xlsx`;
        a.click();
        URL.revokeObjectURL(url);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  //process.env.REACT_APP_API_URL
  // http://localhost:4444/
  async function loadData() {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/plan/latest`,
        {}
      );
      const data = response.data;
      data.reverse(); // Развернул даты
      setTaskData(data); // Обновляем taskData

      const checkAdmin = await axios
        .post("/auth/checkadmin", { login })
        .then((response) => {
          setIsAdmin(response.data.isAdmin);
        });
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    if (login) {
      loadData();
    }
  }, []);

  if (status === "loading") {
    return <div></div>;
  }

  function checkMonday() {
    const today = new Date();
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

    // Проверка, является ли сегодня понедельником
    if (today.getDay() === 1) {
      console.log(`Сегодня понедельник: ${formatDate(today)}`);
      if (window.confirm(`Отправить запрос на начало новой недели?`)) {
        sendRequest(formatDate(today));
      }
    }

    // Проверка, является ли завтра понедельником
    if (tomorrow.getDay() === 1) {
      console.log(`Завтра понедельник: ${formatDate(tomorrow)}`);
      if (window.confirm(`Отправить запрос на начало новой недели?`)) {
        sendRequest(formatDate(tomorrow));
      }
    }
  }

  // Функция для форматирования даты
  function formatDate(date) {
    let dd = date.getDate();
    if (dd < 10) dd = "0" + dd;

    let mm = date.getMonth() + 1;
    if (mm < 10) mm = "0" + mm;

    let yyyy = date.getFullYear();

    return `${dd}.${mm}.${yyyy}`;
  }

  // Функция для отправки запроса
  async function sendRequest(data) {
    console.log(data);
    try {
      const response = await axios
        .post("/generate-plan", { data: data })
        .then((response) => {
          console.log(response.data);
          window.location.reload();
        });
      console.log(response.data);
    } catch (error) {
      if (error.response) {
        console.error("Ошибка:", error.response.data.message);
      } else {
        console.error("Ошибка:", error);
      }
    }
  }

  const onClickLogout = () => {
    if (window.confirm("Вы хотите выйти?")) {
      dispatch(logout());
      window.localStorage.removeItem("token");
      window.localStorage.removeItem("userWork");
    }
  };

  const handleInputChange = (id, shiftIndex, value) => {
    const updatedTaskData = [...taskData];
    const task = updatedTaskData.find((item) => item._id === id);
    if (task) {
      task.logins[shiftIndex] = value;
      setTaskData(updatedTaskData);
    }
  };

  const updateInterval = 10 * 1000; // 10 секунд

  function showNotification(message) {
    setNotification(message);
  }

  function hideNotification() {
    setNotification(null);
  }

  const handleSubmit = () => {
    const currentTime = Date.now();
    if (currentTime - lastUpdate < updateInterval) {
      const remainingTime = Math.ceil(
        (updateInterval - (currentTime - lastUpdate)) / 1000
      );
      alert(`Слишком частые обновления. Подождите ${remainingTime} секунд.`);
      return;
    }

    setLastUpdate(currentTime);

    const dataToSend = taskData.map((item) => ({
      date: item.date,
      logins: item.logins,
      type: item.type,
      version: item.version,
    }));

    showNotification("Данные отправляются...");

    axios
      .post("/plan/general", { data: dataToSend })
      .then((response) => {
        showNotification("Данные обновлены");
        setTimeout(hideNotification, 2000); // скрываем уведомление через 2 секунды
        console.log(response.data);
      })
      .catch((error) => {
        showNotification("Ошибка при отправке данных");
        setTimeout(hideNotification, 2000); // скрываем уведомление через 2 секунды
        console.error(error);
      });
  };

  const dayData = taskData.filter((item) => item.type === "day");
  const nightData = taskData.filter((item) => item.type === "night");

  return (
    <>
      {isAuth ? (
        <>
          <div className="schedule-content">
            <header className="work-header">
              <nav className="work-nav">
                <ul className="navigation">
                  <li className="nav-header">
                    <a href="/work">Офис</a>
                  </li>
                  <li className="navigation__element">
                    <a href="/work">Смена</a>
                  </li>
                  <li className="navigation__element">
                    <a href="/schedule" className="current">
                      Расписание
                    </a>
                  </li>
                  <li className="navigation__element">
                    <a href="/expenses">Расходы</a>
                  </li>
                  <li>
                    <a className="logout-icon">
                      <button onClick={onClickLogout}>
                        <img src={logoutIcon} alt="logout icon" />
                      </button>
                    </a>
                  </li>
                </ul>
              </nav>
            </header>
            <main className="schedule-main">
              <div className="tables">
                {isAdmin && (
                  <button className="reset-button" onClick={checkMonday}>
                    Обновить данные
                  </button>
                )}
                {isAdmin && (
                  <div className="schedule-pick">
                    <input
                      className="work-block-input"
                      type="date"
                      value={selectedDateFrom}
                      onChange={handleDateFromChange}
                    />
                    <input
                      className="work-block-input"
                      type="date"
                      value={selectedDateTo}
                      onChange={handleDateToChange}
                    />
                    <button
                      onClick={exportToExcelWithSelectedDates}
                      className="reset-button"
                    >
                      Скачать в Excel
                    </button>
                  </div>
                )}

                <h2>День</h2>
                <table>
                  <thead>
                    <tr>
                      {dayData.map((item, index) => (
                        <th key={index}>{item.date}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[1, 2, 3, 4, 5, 6, 7].map((shift) => (
                      <tr key={shift}>
                        {dayData.map((item, index) => (
                          <td
                            key={`${index}-day-${shift}`}
                            id={shift * 10 + index}
                          >
                            <input
                              type="text"
                              value={item.logins[shift - 1] || ""}
                              onChange={(e) =>
                                handleInputChange(
                                  item._id,
                                  shift - 1,
                                  e.target.value
                                )
                              }
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>

                <h2>Ночь</h2>
                <table>
                  <thead>
                    <tr>
                      {nightData.map((item, index) => (
                        <th key={index}>{item.date}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[1, 2, 3].map((shift) => (
                      <tr key={shift}>
                        {nightData.map((item, index) => (
                          <td
                            key={`${index}-night-${shift}`}
                            id={shift * 10 + index}
                          >
                            <input
                              type="text"
                              value={item.logins[shift - 1] || ""}
                              onChange={(e) =>
                                handleInputChange(
                                  item._id,
                                  shift - 1,
                                  e.target.value
                                )
                              }
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {notification && (
                  <div
                    style={{
                      position: "fixed",
                      top: 10,
                      right: 10,
                      backgroundColor: "#4CAF50",
                      color: "#fff",
                      padding: "10px 20px",
                      borderRadius: 5,
                      boxShadow: "0 0 10px rgba(0, 0, 0, 0.2)",
                      zIndex: 1000, // чтобы уведомление было поверх других элементов
                    }}
                  >
                    {notification}
                  </div>
                )}
                <button
                  onClick={handleSubmit}
                  className="button-login-work schedule-button-save"
                >
                  Сохранить
                </button>
              </div>
            </main>
          </div>
        </>
      ) : (
        <Navigate to="/" replace />
      )}
    </>
  );
};

export default TableComponent;
