import { useDispatch, useSelector } from "react-redux";
import styles from "../components/Work/Work.css";
import logoutIcon from "./logout.svg";
import { logout, selectIsAuth } from "../redux/slices/auth";
import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "../axios";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const Work = () => {
  const dispatch = useDispatch();
  const isAuth = useSelector(selectIsAuth);
  const status = useSelector((state) => state.auth.status);

  const [type, setType] = useState("");
  const [taxi1, setTaxi1] = useState("");
  const [taxi2, setTaxi2] = useState("");
  const [date, setDate] = useState("");

  const [earnings, setEarnings] = useState([]);

  const login = window.localStorage.getItem("userWork");

  async function loadData() {
    const { data } = await axios.get(`/workedday/${login}`, {});
    setEarnings(data);

    return data;
  }

  useEffect(() => {
    if (login) {
      async function fetchData() {
        const { data } = await axios.get(`/workedday/${login}`, {});
        setEarnings(data);

        return data;
      }

      fetchData().then((data) => {});
    }
  }, []);
  if (status === "loading") {
    return <div></div>;
  }

  console.log("isAuth:", isAuth);

  const onClickLogout = () => {
    if (window.confirm("Вы хотите выйти?")) {
      dispatch(logout());
      window.localStorage.removeItem("token");
      window.localStorage.removeItem("userWork");
    }
  };

  const onSubmitForm = (e) => {
    e.preventDefault(); // предотвращаем отправку формы
    const [year, month, day] = date.split("-");

    const formattedDate = `${day}.${month}.${year}`;

    console.log(
      `Type: ${type}, Taxi 1: ${taxi1}, Taxi 2: ${taxi2}, Date: ${formattedDate}`
    );

    const earn = Number(taxi1) + Number(taxi2);

    if (isNaN(earn) || typeof earn !== "number") {
      console.error("Earn value is not a valid number:", earn);
      return;
    }

    axios
      .post("/workedday", {
        date: formattedDate,
        login,
        earn,
        type,
      })
      .then((response) => {
        console.log(response.data);
        loadData();
      })
      .catch((error) => {
        if (error.response && error.response.data) {
          const errorMessage = error.response.data.message;
          alert(errorMessage);
          console.error(errorMessage);
        } else {
          alert("Unknown error");
          console.error(error);
        }
      });
  };

  return (
    <>
      {isAuth ? (
        <>
          <div className="work-content">
            <header className="work-header">
              <nav className="work-nav">
                <ul className="navigation">
                  <li className="nav-header">
                    <a href="/work">Офис</a>
                  </li>
                  <li className="navigation__element">
                    <a href="/work" className="current">
                      Смена
                    </a>
                  </li>
                  <li className="navigation__element">
                    <a href="/schedule">Расписание</a>
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
            <main className="work-main">
              <section className="left-side">
                <form onSubmit={onSubmitForm}>
                  <h2>Добавить смену</h2>
                  <div className="radio-buttons">
                    <div className="radio-button button-day">
                      <input
                        className="work-input"
                        type="radio"
                        required
                        id="night-shift"
                        name="shift"
                        value="День"
                        onChange={(e) => setType(e.target.value)}
                      />
                      <label htmlFor="night-shift">День</label>
                    </div>
                    <div className="radio-button button-night">
                      <input
                        type="radio"
                        required
                        id="day-shift"
                        name="shift"
                        value="Ночь"
                        onChange={(e) => setType(e.target.value)}
                      />
                      <label htmlFor="day-shift">Ночь</label>
                    </div>
                  </div>
                  <div className="input-date-block">
                    <input
                      className="work-block-input"
                      type="date"
                      id="date"
                      name="date"
                      required
                      placeholder="Дата"
                      onChange={(e) => setDate(e.target.value)}
                    />
                    <label htmlFor="date">Дата работы</label>
                  </div>
                  <div className="text-inputs">
                    <div className="input-block">
                      <input
                        className="work-block-input"
                        type="text"
                        id="taxi1"
                        name="taxi1"
                        required
                        maxLength="10"
                        placeholder="Сумма"
                        onChange={(e) => setTaxi1(e.target.value)}
                      />
                      <label htmlFor="taxi1">Такси на работу</label>
                    </div>
                    <div className="input-block">
                      <input
                        className="work-block-input"
                        type="text"
                        id="taxi2"
                        name="taxi2"
                        required
                        maxLength="10"
                        placeholder="Сумма"
                        onChange={(e) => setTaxi2(e.target.value)}
                      />
                      <label htmlFor="taxi2">Такси с работы</label>
                    </div>
                  </div>
                  <button type="submit" className="button-login-work">
                    Добавить
                  </button>
                </form>
              </section>
              <section className="right-side">
                <h2>Заработано</h2>
                <h5 className="total">
                  Итого:{" "}
                  {earnings.reduce((acc, current) => acc + current.earn, 0)} p
                </h5>
                <ul className="money">
                  {earnings.map((item, index) => (
                    <li key={index}>
                      <span className="money-day">
                        {item.date} ({item.type})
                      </span>{" "}
                      - {item.earn} p
                    </li>
                  ))}
                </ul>
                <button
                  className="button-login-work"
                  onClick={async () => {
                    try {
                      const login = window.localStorage.getItem("userWork");
                      const response = await axios.post(`/pay-salary/${login}`);
                      console.log(response.data);
                      loadData();
                    } catch (error) {
                      if (error.response && error.response.data) {
                        const errorMessage = error.response.data.message;
                        alert(errorMessage);
                        console.error(errorMessage);
                      } else {
                        alert("Unknown error");
                        console.error(error);
                      }
                    }
                  }}
                >
                  Получил зарплату
                </button>
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
