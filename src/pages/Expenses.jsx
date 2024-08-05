import React, { useEffect, useState } from "react";
import axios from "../axios";
import styles from "./TableComponent.css";
import { logout, selectIsAuth } from "../redux/slices/auth";
import { useDispatch, useSelector } from "react-redux";
import styles2 from "../components/Work/Work.css";
import styles3 from "../components/Expenses/Expenses.css";
import { Navigate } from "react-router-dom";
import logoutIcon from "./logout.svg";

const Expenses = () => {
  const [taskData, setTaskData] = useState([]);
  const isAuth = useSelector(selectIsAuth);
  const [notification, setNotification] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [expenses, setExpenses] = useState([]);

  const today = new Date();
  const startDate = `${today.getFullYear()}-${(today.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${today.getDate().toString().padStart(2, "0")}`;

  const [selectedDateFrom, setSelectedDateFrom] = useState(startDate);
  const [selectedDateTo, setSelectedDateTo] = useState(startDate);
  const status = useSelector((state) => state.auth.status);
  const [data, setData] = useState({
    headers: [],
    rows: [],
  });

  const [expenseType, setExpenseType] = useState("Еда");
  const [amount, setAmount] = useState("");
  const [comment, setComment] = useState("");

  const handleExpenseTypeChange = (event) => {
    setExpenseType(event.target.value);
  };

  const handleAmountChange = (event) => {
    setAmount(event.target.value);
  };

  const handleCommentChange = (event) => {
    setComment(event.target.value);
  };

  const handleSubmitForm = (event) => {
    event.preventDefault();
    const date = `${startDate.split("-")[2]}.${startDate.split("-")[1]}.${
      startDate.split("-")[0]
    }`;
    const expenseData = {
      date,
      type: expenseType,
      comment,
      price: amount,
    };

    axios
      .post(process.env.REACT_APP_API_URL, expenseData)
      .then((response) => {
        console.log("Расход добавлен:", response.data);
        handleSubmit();
      })
      .catch((error) => {
        console.error("Ошибка во время выполнения:", error);
      });
  };

  const dispatch = useDispatch();

  const login = window.localStorage.getItem("userWork");

  async function loadData() {
    try {
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

    const today = new Date();
    const startDate = `${today.getDate().toString().padStart(2, "0")}.${(
      today.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}.${today.getFullYear()}`;
    const endDate = startDate;

    axios
      .post("/expenditure/bydate", {
        startDate,
        endDate,
      })
      .then((response) => {
        setExpenses(response.data);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  if (status === "loading") {
    return <div></div>;
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
    const startDate = `${selectedDateFrom.split("-")[2]}.${
      selectedDateFrom.split("-")[1]
    }.${selectedDateFrom.split("-")[0]}`;
    const endDate = `${selectedDateTo.split("-")[2]}.${
      selectedDateTo.split("-")[1]
    }.${selectedDateTo.split("-")[0]}`;

    axios
      .post("/expenditure/bydate", {
        startDate,
        endDate,
      })
      .then((response) => {
        setExpenses(response.data);
      })
      .catch((error) => {
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
                    <a href="/schedule">Расписание</a>
                  </li>
                  <li className="navigation__element">
                    <a href="/work" className="current">
                      Расходы
                    </a>
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
            <main className="expenses-main">
              <section className="schedule-left-side">
                <form onSubmit={handleSubmitForm}>
                  <label>
                    Вид расхода:
                    <select
                      value={expenseType}
                      onChange={handleExpenseTypeChange}
                      className="left-side-select"
                      required
                    >
                      <option value="Еда">Еда</option>
                      <option value="Подписка">Подписка</option>
                      <option value="Прочее">Прочее</option>
                      {/* Добавьте больше вариантов по мере необходимости */}
                    </select>
                  </label>
                  <label>
                    Сумма:
                    <input
                      type="number"
                      value={amount}
                      onChange={handleAmountChange}
                      className="left-side-input"
                      required
                    />
                  </label>
                  <label>
                    Комментарий:
                    <textarea value={comment} onChange={handleCommentChange} />
                  </label>
                  <button
                    type="submit"
                    className="button-login-work expenses-button-save"
                  >
                    Добавить расход
                  </button>
                </form>
              </section>
              <section className="schedule-right-side">
                <input
                  className="schedule-block-input"
                  type="date"
                  value={selectedDateFrom}
                  onChange={(e) => setSelectedDateFrom(e.target.value)}
                />
                <input
                  className="schedule-block-input"
                  type="date"
                  value={selectedDateTo}
                  onChange={(e) => setSelectedDateTo(e.target.value)}
                />
                <button
                  className="schedule-block-input block-button"
                  onClick={handleSubmit}
                >
                  Обновить
                </button>
                <div className="right-grid">
                  <div className="schedule-right-side-header">
                    <span>Тип</span>
                    <span>Цена</span>
                    <span>Комментарий</span>
                  </div>
                  {expenses.map((expense, index) => (
                    <div key={index} className="schedule-right-side-row">
                      <span>{expense.type}</span>
                      <span>{expense.price}</span>
                      <span>{expense.comment}</span>
                    </div>
                  ))}
                </div>
              </section>
            </main>
          </div>
        </>
      ) : (
        <Navigate to="/" replace />
      )}
    </>
  );
};

export default Expenses;
