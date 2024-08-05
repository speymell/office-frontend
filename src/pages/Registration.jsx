import React from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Grid from "@mui/material/Grid";

import styles from "../components/Main/styles.css";
import { Paper } from "@mui/material";
import axios from "../axios";
import { useDispatch, useSelector } from "react-redux";
import { fetchAuth, fetchRegister, selectIsAuth } from "../redux/slices/auth";
import { useForm } from "react-hook-form";
import { Navigate } from "react-router-dom";

export const Registration = () => {
  const isAuth = useSelector(selectIsAuth);
  const dispatch = useDispatch();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isValid },
  } = useForm({
    defaultValues: {
      login: "",
      password: "",
    },
    mode: "onChange",
  });

  const onSubmit = async (values) => {
    const data = await dispatch(fetchRegister(values));
    console.log(values);
    if (!data.payload) {
      return alert("Не удалось зарегистрироваться");
    }

    if ("token" in data.payload) {
      window.localStorage.setItem("token", data.payload.token);
      window.localStorage.setItem("userWork", data.payload.login);
    } else {
      alert("Не удалось зарегистрироваться");
    }
  };

  if (isAuth) {
    return <Navigate to="/work" />;
  }

  return (
    <div className="page-content">
      <header>Офис</header>
      <main>
        <form class="login" onSubmit={handleSubmit(onSubmit)}>
          <h2>Регистрация</h2>
          <div class="buttons">
            <input
              type="text"
              id="name"
              name="name"
              required
              minlength="4"
              maxlength="60"
              placeholder="Логин"
              {...register("login", { required: "Введите логин" })}
            />
            <input
              type="password"
              id="password"
              name="password"
              required
              minlength="4"
              maxlength="60"
              placeholder="Пароль"
              {...register("password", { required: "Введите логин" })}
            />
          </div>
          <div class="buttons-finish">
            <button type="submit" class="button-login">
              Регистрация
            </button>
            <a href="/">
              <button type="button" onClick={() => {}}>
                Уже есть аккаунт
              </button>
            </a>
          </div>
        </form>
      </main>
    </div>
  );
};
