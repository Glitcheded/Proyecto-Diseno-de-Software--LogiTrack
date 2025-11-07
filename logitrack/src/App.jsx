import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LoginSignup } from "./components/LoginSignup";
import { Chat } from "./components/Chat";
import { Home } from "./components/Home";
import { ActualizarContrasena } from './components/ActualizarContrasena';

function App() {
  return (
    <>
    <ToastContainer position="top-right" autoClose={3000} />
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginSignup />} />
        <Route path="/home" element={<Home />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/actualizar-contrasena" element={<ActualizarContrasena />} />
      </Routes>
    </BrowserRouter>
    </>
  );
}

export default App;
