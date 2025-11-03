import React, { useState, useEffect } from "react";
import { NavBar } from "./NavBar";
import "./Home.css";

import { useLocation, useNavigate } from "react-router-dom";

import { MisTareas } from "./vistas/MisTareas";
import { GoogleCalendario } from "./vistas/GoogleCalendario";
import { Notificaciones } from "./vistas/Notificaciones";
import { MisProyectos } from "./vistas/MisProyectos";
import { ProyectosAnteriores } from "./vistas/ProyectosAnteriores";
import { Opciones } from "./vistas/Opciones";

import { MisProyectosSub } from "./vistas/MisProyectosSub";
import { ProyectosAnterioresSub } from "./vistas/ProyectosAnterioresSub";

export const Home = () => {
  const location = useLocation();
  const initialView = location.state?.view || "Mis Tareas";
  const navigate = useNavigate();

  const [selectedView, setSelectedView] = useState(initialView);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectList, setProjectList] = useState([]);

  useEffect(() => {
    const fetchData = () => {
      const simulatedData = [
        {
          id: 1,
          name: "Rediseño de Soltura Web",
          description:
            "Actualización completa del sitio web con nuevo sistema de suscripción.",
          lastModification: "2025-10-15",
          state: "En proceso",
          nextDeliveryDate: "2025-11-05",
          members: 5,
          memberList: [
            {
              id: 1,
              name: "Giovanni Esquivel",
              email: "giovanni@soltura.com",
              role: "Administrador",
            },
            {
              id: 2,
              name: "Lucía Martínez",
              email: "lucia@soltura.com",
              role: "Gestor de proyectos",
            },
            {
              id: 3,
              name: "Carlos Jiménez",
              email: "carlos@soltura.com",
              role: "Colaborador",
            },
            {
              id: 4,
              name: "María López",
              email: "maria@soltura.com",
              role: "Colaborador",
            },
            {
              id: 5,
              name: "Pedro Sánchez",
              email: "pedro@soltura.com",
              role: "Observador",
            },
          ],
        },
        {
          id: 2,
          name: "Campaña Publicitaria Q3",
          description:
            "Estrategia de marketing digital para impulsar ventas del tercer trimestre.",
          lastModification: "2025-09-10",
          state: "Finalizado",
          finishDate: "2025-09-30",
          members: 8,
          memberList: [
            {
              id: 1,
              name: "Laura Gómez",
              email: "laura@soltura.com",
              role: "Administrador",
            },
            {
              id: 2,
              name: "Andrés Torres",
              email: "andres@soltura.com",
              role: "Gestor de proyectos",
            },
            {
              id: 3,
              name: "Javier Castro",
              email: "javier@soltura.com",
              role: "Colaborador",
            },
            {
              id: 4,
              name: "Sofía Rivera",
              email: "sofia@soltura.com",
              role: "Colaborador",
            },
            {
              id: 5,
              name: "Diego Ruiz",
              email: "diego@soltura.com",
              role: "Colaborador",
            },
            {
              id: 6,
              name: "Carmen León",
              email: "carmen@soltura.com",
              role: "Colaborador",
            },
            {
              id: 7,
              name: "Elena Vargas",
              email: "elena@soltura.com",
              role: "Observador",
            },
            {
              id: 8,
              name: "Tomás Vega",
              email: "tomas@soltura.com",
              role: "Observador",
            },
          ],
        },
        {
          id: 3,
          name: "Integración de Pasarela de Pago",
          description:
            "Implementación de Stripe como nuevo método de pago en la plataforma.",
          lastModification: "2025-08-22",
          state: "Finalizado",
          finishDate: "2025-09-01",
          members: 3,
          memberList: [
            {
              id: 1,
              name: "Daniel Mora",
              email: "daniel@soltura.com",
              role: "Administrador",
            },
            {
              id: 2,
              name: "Patricia Fernández",
              email: "patricia@soltura.com",
              role: "Gestor de proyectos",
            },
            {
              id: 3,
              name: "Miguel Castillo",
              email: "miguel@soltura.com",
              role: "Colaborador",
            },
          ],
        },
        {
          id: 4,
          name: "Programa de Lealtad Soltura+",
          description:
            "Desarrollo del sistema de recompensas para clientes frecuentes.",
          lastModification: "2025-07-05",
          state: "Cancelado",
          finishDate: "2025-07-18",
          members: 6,
          memberList: [
            {
              id: 1,
              name: "Adriana Quesada",
              email: "adriana@soltura.com",
              role: "Administrador",
            },
            {
              id: 2,
              name: "Luis Herrera",
              email: "luis@soltura.com",
              role: "Gestor de proyectos",
            },
            {
              id: 3,
              name: "José Araya",
              email: "jose@soltura.com",
              role: "Colaborador",
            },
            {
              id: 4,
              name: "Ana Vargas",
              email: "ana@soltura.com",
              role: "Colaborador",
            },
            {
              id: 5,
              name: "Ernesto Rojas",
              email: "ernesto@soltura.com",
              role: "Colaborador",
            },
            {
              id: 6,
              name: "Paola Castro",
              email: "paola@soltura.com",
              role: "Observador",
            },
          ],
        },
        {
          id: 5,
          name: "Optimización del Servidor",
          description:
            "Mejora del rendimiento y reducción de tiempos de carga del backend.",
          lastModification: "2025-06-12",
          state: "En proceso",
          nextDeliveryDate: "2025-11-15",
          members: 4,
          memberList: [
            {
              id: 1,
              name: "Ricardo Molina",
              email: "ricardo@soltura.com",
              role: "Administrador",
            },
            {
              id: 2,
              name: "Sergio León",
              email: "sergio@soltura.com",
              role: "Gestor de proyectos",
            },
            {
              id: 3,
              name: "Natalia Vargas",
              email: "natalia@soltura.com",
              role: "Colaborador",
            },
            {
              id: 4,
              name: "Pablo Mora",
              email: "pablo@soltura.com",
              role: "Colaborador",
            },
          ],
        },
      ];

      setProjectList(simulatedData);
    };

    fetchData();

    if (location.state?.view) {
      setSelectedView(location.state.view);
      navigate("/home", { replace: true }); // borra el estado del historial
    }
  }, [location.state?.view]);

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
            projectList={projectList}
            setProjectList={setProjectList}
          />
        );
      case "Proyectos Anteriores":
        return (
          <ProyectosAnteriores
            projectList={projectList}
            setProjectList={setProjectList}
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
        projectList={projectList}
        selectedProject={selectedProject}
        setSelectedProject={setSelectedProject}
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
