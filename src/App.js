import Container from "@mui/material/Container";
import { Routes, Route } from "react-router-dom";

import { useDispatch, useSelector } from "react-redux";

import { Registration } from "./pages/Registration.jsx";

import { Home } from "./pages/Home.jsx";
import TableComponent from "./pages/TableComponent.jsx";
import { Work } from "./pages/Work.jsx";
import React from "react";
import { fetchAuthMe, selectIsAuth } from "./redux/slices/auth.js";
import Expenses from "./pages/Expenses.jsx";

function App() {
  const dispatch = useDispatch();
  const isAuth = useSelector(selectIsAuth);

  React.useEffect(() => {
    dispatch(fetchAuthMe());
  }, []);

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/work" element={<Work />} />
        <Route path="/schedule" element={<TableComponent />} />
        <Route path="/expenses" element={<Expenses />} />
        <Route path="/registration" element={<Registration />} />
      </Routes>
    </>
  );
}

export default App;
