'use client';

import { useState, useEffect } from 'react';

// Definimos los estatus de los turnos
const STATUS = {
  CREATED: 0,
  ASSIGNED_TO_QUEUE: 1,
  ASSIGNED_TO_DISPATCHER: 2,
  IN_PROGRESS: 3,
  FINISHED: 4,
};

export default function BankQueueSystem() {
  const [turnos, setTurnos] = useState([
    { id: 103, status: STATUS.CREATED },
    { id: 104, status: STATUS.CREATED },
    { id: 105, status: STATUS.CREATED },
    { id: 106, status: STATUS.CREATED },
  ]);

  const [agente, setAgente] = useState<{
    id: number;
    nombre: string;
    estatus: string;
    turnoActual: number | null;
    enEspera: number[];
  }>({
    id: 1,
    nombre: 'Agente #1',
    estatus: 'Libre para atender',
    turnoActual: null,
    enEspera: [],
  });

  const [logs, setLogs] = useState<string[]>([]); // Estado para almacenar los logs visibles

  const addLog = (message: string) => {
    setLogs((prevLogs) => [...prevLogs, message]);
  };

  const sendNotification = (title: string, body: string) => {
    if (Notification.permission === 'granted') {
      new Notification(title, { body });
      addLog(`Notificación enviada: ${title} - ${body}`);
    } else {
      addLog('Notificación no enviada: Permiso no concedido.');
    }
  };

  const handleAsignarTurno = () => {
    if (turnos.length === 0) {
      addLog('No hay turnos disponibles.');
      return;
    }

    const [primerTurno, ...restantes] = turnos;
    primerTurno.status = STATUS.ASSIGNED_TO_DISPATCHER;

    setAgente((prev) => ({
      ...prev,
      enEspera: [...prev.enEspera, primerTurno.id],
    }));
    setTurnos(restantes);

    addLog(`Turno ${primerTurno.id} asignado. Estatus: ${getStatusLabel(primerTurno.status)}`);
  };

  const handleLlamarTurno = () => {
    if (agente.enEspera.length === 0) {
      addLog('No hay turnos en espera.');
      return;
    }

    const [primerTurno, ...restantesEnEspera] = agente.enEspera;

    setAgente((prev) => ({
      ...prev,
      estatus: 'Atendiendo',
      turnoActual: primerTurno,
      enEspera: restantesEnEspera,
    }));

    sendNotification('Turno asignado', `El turno ${primerTurno} está ahora EN PROGRESO.`);
    addLog(`Turno ${primerTurno} cambiado a IN_PROGRESS.`);
  };

  const handleTerminarTurno = () => {
    if (!agente.turnoActual) {
      addLog('No hay turno actual para terminar.');
      return;
    }

    const turnoTerminado = agente.turnoActual;

    setAgente((prev) => ({
      ...prev,
      estatus: 'Libre para atender',
      turnoActual: null,
    }));

    addLog(`Turno ${turnoTerminado} terminado. Estatus: FINISHED.`);
  };

  const getStatusLabel = (status: number) => {
    switch (status) {
      case STATUS.CREATED:
        return 'CREATED';
      case STATUS.ASSIGNED_TO_QUEUE:
        return 'ASSIGNED_TO_QUEUE';
      case STATUS.ASSIGNED_TO_DISPATCHER:
        return 'ASSIGNED_TO_DISPATCHER';
      case STATUS.IN_PROGRESS:
        return 'IN_PROGRESS';
      case STATUS.FINISHED:
        return 'FINISHED';
      default:
        return 'UNKNOWN';
    }
  };

  // Solicitar permisos de notificaciones y registrar el Service Worker al cargar la página
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Solicitar permisos de notificaciones
        if ('Notification' in window) {
          const permission = await Notification.requestPermission();
          if (permission === 'granted') {
            addLog('Permiso para notificaciones concedido.');
          } else {
            addLog('Permiso para notificaciones denegado.');
          }
        }

        // Registrar el Service Worker
        if ('serviceWorker' in navigator) {
          const registration = await navigator.serviceWorker.register('/service-worker.js');
          addLog('Service Worker registrado con éxito.');
          console.log('Service Worker registrado:', registration);

          // Detectar actualizaciones del Service Worker
          registration.onupdatefound = () => {
            const installingWorker = registration.installing;
            if (installingWorker) {
              installingWorker.onstatechange = () => {
                if (installingWorker.state === 'installed') {
                  if (navigator.serviceWorker.controller) {
                    addLog('Nueva versión disponible. Actualiza la página para usarla.');
                  } else {
                    addLog('Contenido en caché listo para usarse sin conexión.');
                  }
                }
              };
            }
          };
        } else {
          addLog('El navegador no soporta Service Workers.');
        }
      } catch (error) {
        addLog(`Error inicializando la aplicación: ${(error as Error).message}`);
      }
    };

    initializeApp();
  }, []);

  return (
    <div className="p-4">
      {/* Turnos por asignar */}
      <div className="mb-4">
        <h2 className="text-lg font-bold">Turnos por asignar:</h2>
        <div className="flex flex-wrap gap-4">
          {turnos.map((turno) => (
            <div
              key={turno.id}
              className="bg-blue-500 text-white px-4 py-2 rounded flex flex-col items-center text-sm"
            >
              <span>Turno: {turno.id}</span>
              <span className="text-xs bg-white text-blue-500 px-2 py-1 rounded mt-1">
                {getStatusLabel(turno.status)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Tabla de agente */}
      <div className="overflow-x-auto">
        <table className="table-auto border-collapse w-full text-left">
          <thead>
            <tr className="bg-blue-800 text-white text-sm">
              <th className="border px-2 py-1 md:px-4 md:py-2">Módulo</th>
              <th className="border px-2 py-1 md:px-4 md:py-2">Ejecutivo</th>
              <th className="border px-2 py-1 md:px-4 md:py-2">Estatus</th>
              <th className="border px-2 py-1 md:px-4 md:py-2">Turno Actual</th>
              <th className="border px-2 py-1 md:px-4 md:py-2">En Espera</th>
              <th className="border px-2 py-1 md:px-4 md:py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border px-2 py-1 md:px-4 md:py-2">{agente.id}</td>
              <td className="border px-2 py-1 md:px-4 md:py-2">{agente.nombre}</td>
              <td
                className={`border px-2 py-1 md:px-4 md:py-2 ${
                  agente.estatus === 'Libre para atender' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {agente.estatus}
              </td>
              <td className="border px-2 py-1 md:px-4 md:py-2">
                {agente.turnoActual || 'Sin turno actual'}
              </td>
              <td className="border px-2 py-1 md:px-4 md:py-2">
                {agente.enEspera.length > 0 ? agente.enEspera.join(', ') : '-'}
              </td>
              <td className="border px-2 py-1 md:px-4 md:py-2 space-y-2 md:space-y-0 md:space-x-2">
                <button
                  className="bg-teal-500 text-white px-4 py-2 rounded w-full md:w-auto"
                  onClick={handleAsignarTurno}
                  disabled={turnos.length === 0}
                >
                  Asignar
                </button>
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded w-full md:w-auto"
                  onClick={handleLlamarTurno}
                  disabled={agente.enEspera.length === 0}
                >
                  Llamar
                </button>
                <button
                  className="bg-red-500 text-white px-4 py-2 rounded w-full md:w-auto"
                  onClick={handleTerminarTurno}
                  disabled={!agente.turnoActual}
                >
                  Terminar
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Logs visibles */}
      <div className="mt-4 border-t-2 border-black w-full max-w-xl p-4">
        <h3 className="text-lg font-bold">Logs:</h3>
        <ul className="list-disc pl-6">
          {logs.map((log, index) => (
            <li key={index} className="text-sm">
              {log}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
