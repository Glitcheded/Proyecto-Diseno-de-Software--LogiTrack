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

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const baseURL = `${API_BASE_URL}/api`;

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
  const [selectedProjectName, setSelectedProjectName] = useState(null);
  const [selectedProjectRole, setSelectedProjectRole] = useState(null);
  const [misProyectos, setMisProyectos] = useState([]);
  const [proyectosAnteriores, setProyectosAnteriores] = useState([]);

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem("supabaseToken");
      if (!token) {
        console.warn("No token found in localStorage");
        return;
      }

      const res = await fetch(`${baseURL}/projects/datos-proyectos`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.warn("Failed to fetch datos-proyectos:", errorText);
        return;
      }

      const proyectos = await res.json();

      const misProyectosList = proyectos.filter(
        (p) => p.idEstadoProyecto === 1
      );
      const proyectosAnterioresList = proyectos.filter(
        (p) => p.idEstadoProyecto !== 1
      );

      console.log("Todos mis proyectos: ", proyectos);

      setMisProyectos(misProyectosList);
      setProyectosAnteriores(proyectosAnterioresList);
    } catch (err) {
      console.error("Failed to fetch projects:", err);
    }
  };

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
            ("Token refreshed");
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

    fetchUser();
    fetchProjects();
  }, []);

  useEffect(() => {
    if (userName) "Username updated:", userName;
  }, [userName]);

  useEffect(() => {
    if (misProyectos.length > 0) "Mis Proyectos updated:", misProyectos;
  }, [misProyectos]);

  useEffect(() => {
    if (proyectosAnteriores.length > 0)
      "Proyectos Anteriores updated:", proyectosAnteriores;
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
            fetchProjects={fetchProjects}
            selectedProjectRole={selectedProjectRole}
          />
        );
      case "Proyectos Anteriores":
        return (
          <ProyectosAnteriores
            projectList={proyectosAnteriores}
            setProjectList={setProyectosAnteriores}
            fetchProjects={fetchProjects}
          />
        );
      case "Opciones":
        return <Opciones />;
      case "Mis Proyectos / Proyecto":
        return (
          <MisProyectosSub
            selectedProject={selectedProject}
            selectedProjectName={selectedProjectName}
            selectedProjectRole={selectedProjectRole}
          />
        );
      case "Proyectos Anteriores / Proyecto":
        return (
          <ProyectosAnterioresSub
            selectedProject={selectedProject}
            selectedProjectName={selectedProjectName}
            selectedProjectRole={selectedProjectRole}
          />
        );
      default:
        return <Opciones />;
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
        setSelectedProjectName={setSelectedProjectName}
        setSelectedProjectRole={setSelectedProjectRole}
      />

      <main
        className="right-container"
        role="main"
        aria-labelledby="main-heading"
      >
        <header className="menu-header">
          <h1 id="main-heading" tabIndex="0">
            {selectedView === "Mis Proyectos / Proyecto" ||
            selectedView === "Proyectos Anteriores / Proyecto"
              ? selectedProjectName
              : selectedView}
          </h1>
        </header>

        <section
          className="view-container"
          aria-live="polite"
          aria-busy={!selectedView}
        >
          {renderView()}
        </section>
      </main>
    </div>
  );
};

export const Home = () => (
  <UserProvider>
    <HomeContent />
  </UserProvider>
);
