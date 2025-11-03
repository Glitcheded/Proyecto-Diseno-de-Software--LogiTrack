import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { NavBar } from "./NavBar";
import "./Home.css";

import { MisTareas } from "./vistas/MisTareas";
import { GoogleCalendario } from "./vistas/GoogleCalendario";
import { Notificaciones } from "./vistas/Notificaciones";
import { MisProyectos } from "./vistas/MisProyectos";
import { ProyectosAnteriores } from "./vistas/ProyectosAnteriores";
import { Opciones } from "./vistas/Opciones";
import { MisProyectosSub } from "./vistas/MisProyectosSub";
import { ProyectosAnterioresSub } from "./vistas/ProyectosAnterioresSub";

import { UserProvider, useUser } from "../context/UserContext";

const baseURL = "http://localhost:3001/api";

// --- Wrapped Home logic in a child component so provider sits at the top ---
const HomeContent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const initialView = location.state?.view || "Mis Tareas";

  const {
    userId,
    setUserId,
    userName,
    setUserName,
    userEmail,
    setUserEmail,
    userLastName,
    setUserLastName,
  } = useUser();

  const [selectedView, setSelectedView] = useState(initialView);
  const [selectedProject, setSelectedProject] = useState(null);
  const [misProyectos, setMisProyectos] = useState([]); // Activas
  const [proyectosAnteriores, setProyectosAnteriores] = useState([]); // Terminadas

  useEffect(() => {
    const token = localStorage.getItem("supabaseToken");
    if (!token) {
      console.warn("No token found in localStorage");
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await fetch(`${baseURL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 401) {
          console.warn("Token expired, refreshing...");
          const { data, error } = await supabase.auth.refreshSession();
          if (!error && data?.session?.access_token) {
            localStorage.setItem("supabaseToken", data.session.access_token);
            console.log("Token refreshed");
            return;
          } else {
            console.error("Refresh failed, logging out...");
            localStorage.removeItem("supabaseToken");
            navigate("/");
            return;
          }
        }

        if (!res.ok) throw new Error(res.statusText);
        const user = await res.json();
        setUserId(user.idUsuario);
        setUserName(user.nombre);
        setUserEmail(user.email);
        setUserLastName(user.apellido);
      } catch (err) {
        console.error("Failed to fetch user:", err);
      }
    };

    const fetchProjects = async () => {
      try {
        const [misRes, anterioresRes] = await Promise.all([
          fetch(`${baseURL}/projects/mis-proyectos`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${baseURL}/projects/anteriores`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (misRes.ok) {
          const misData = await misRes.json();
          console.log("Mis proyectos data:", misData);
          setMisProyectos(misData);
        } else {
          const misError = await misRes.text();
          console.warn("Failed to fetch mis-proyectos:", misError);
        }

        if (anterioresRes.ok) {
          const anterioresData = await anterioresRes.json();
          console.log("Proyectos anteriores data:", anterioresData);
          setProyectosAnteriores(anterioresData);
        } else {
          const anterioresError = await anterioresRes.text();
          console.warn(
            "Failed to fetch proyectos anteriores:",
            anterioresError
          );
        }
      } catch (err) {
        console.error("Failed to fetch projects:", err);
      }
    };

    fetchUser();
    fetchProjects();
  }, []);

  useEffect(() => {
    if (userName) console.log("Username updated:", userName);
  }, [userName]);

  useEffect(() => {
    if (misProyectos.length > 0)
      console.log("Mis Proyectos updated:", misProyectos);
  }, [misProyectos]);

  useEffect(() => {
    if (proyectosAnteriores.length > 0)
      console.log("Proyectos Anteriores updated:", proyectosAnteriores);
  }, [proyectosAnteriores]);

  const renderView = () => {
    switch (selectedView) {
      case "Mis Tareas":
        return <MisTareas />;
      case "Google Calendario":
        return <GoogleCalendario />;
      case "Notificaciones":
        return <Notificaciones />;
      case "Mis Proyectos":
        return (
          <MisProyectos
            projectList={misProyectos}
            setProjectList={setMisProyectos}
          />
        );
      case "Proyectos Anteriores":
        return (
          <ProyectosAnteriores
            projectList={proyectosAnteriores}
            setProjectList={setProyectosAnteriores}
          />
        );
      case "Opciones":
        return <Opciones />;
      case "Mis Proyectos / Proyecto":
        return <MisProyectosSub selectedProject={selectedProject} />;
      case "Proyectos Anteriores / Proyecto":
        return <ProyectosAnterioresSub selectedProject={selectedProject} />;
      default:
        return <div>Seleccione una vista</div>;
    }
  };

  return (
    <div className="home-container">
      <NavBar
        currentView={selectedView}
        changeView={setSelectedView}
        misProyectos={misProyectos}
        proyectosAnteriores={proyectosAnteriores}
        selectedProject={selectedProject}
        setSelectedProject={setSelectedProject}
        userName={userName}
      />

      <div className="right-container">
        <div className="menu-header">
          <h1>{selectedView}</h1>
        </div>
        <div className="view-container">{renderView()}</div>
      </div>
    </div>
  );
};

export const Home = () => (
  <UserProvider>
    <HomeContent />
  </UserProvider>
);
