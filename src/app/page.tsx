'use client';
import { useState, useEffect } from 'react';

export default function TimerWithNotifications() {
  const [permission, setPermission] = useState<'default' | 'granted' | 'denied' | 'unsupported'>('default'); // Estado para el permiso de notificaciones
  const [timeLeft, setTimeLeft] = useState(30); // Tiempo restante en segundos (1 minuto)
  const [isRunning, setIsRunning] = useState(false); // Estado para controlar si el contador está en ejecución
  const [logs, setLogs] = useState<string[]>([]); // Estado para almacenar los logs visibles

  // Agregar logs visibles a la pantalla
  const addLog = (message: string) => {
    setLogs((prevLogs) => [...prevLogs, message]);
  };

  // Solicitar permiso automáticamente al cargar la página y registrar el Service Worker
  useEffect(() => {
    const requestPermissionAndRegisterSW = async () => {
      try {
        // Verificar soporte de notificaciones
        if ('Notification' in window) {
          const initialPermission = Notification.permission;
          setPermission(initialPermission);

          if (initialPermission === 'default') {
            const result = await Notification.requestPermission();
            setPermission(result);
            addLog(`Permiso para notificaciones: ${result}`);
          } else {
            addLog(`Permiso inicial para notificaciones: ${initialPermission}`);
          }
        } else {
          setPermission('unsupported'); // Marcar como navegador sin soporte
          addLog('El navegador no soporta notificaciones.');
        }

        // Registrar el Service Worker
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker
            .register('/service-worker.js')
            .then((registration) => {
              addLog('Service Worker registrado con éxito.');
              console.log('Service Worker registrado:', registration);
            })
            .catch((error) => {
              addLog(`Error al registrar el Service Worker: ${error.message}`);
              console.error('Error al registrar el Service Worker:', error);
            });
        } else {
          addLog('El navegador no soporta Service Workers.');
        }
      } catch (error) {
        addLog(`Error general: ${(error as Error).message}`);
      }
    };

    requestPermissionAndRegisterSW();
  }, []);

  // Manejar el inicio del contador
  const startTimer = () => {
    if (!isRunning) {
      setIsRunning(true);
      addLog('Temporizador iniciado.');
    }
  };

  // Manejar el reinicio del temporizador
  const resetTimer = () => {
    setTimeLeft(30);
    setIsRunning(false);
    addLog('Temporizador reiniciado.');

    if (permission === 'granted') {
      navigator.serviceWorker.ready.then((registration) => {
        registration.showNotification('El temporizador se ha reiniciado', {
          body: 'El temporizador ahora está configurado nuevamente a 30 segundos.',
        });
        addLog('Notificación enviada: "El temporizador se ha reiniciado".');
      });
    } else {
      addLog('Notificación no enviada: Permiso no concedido.');
    }
  };

  // Manejar la cuenta regresiva
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
      addLog('El temporizador terminó.');

      if (permission === 'granted') {
        navigator.serviceWorker.ready.then((registration) => {
          registration.showNotification('El tiempo se ha acabado', {
            body: 'Puedes reiniciar el temporizador si lo necesitas.',
          });
          addLog('Notificación enviada: "El tiempo se ha acabado".');
        });
      } else {
        addLog('Notificación no enviada: Permiso no concedido.');
      }
    }

    return () => clearInterval(timer); // Limpiar el intervalo al desmontar o al actualizar
  }, [isRunning, timeLeft, permission]);

  // Formatear el tiempo en minutos y segundos
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  // Generar mensaje según el estado del permiso
  const getPermissionMessage = () => {
    if (permission === 'granted') {
      return ''; // No mostrar mensaje si el permiso está concedido
    } else if (permission === 'denied') {
      return 'Para una mejor experiencia, activa las notificaciones.';
    } else if (permission === 'unsupported') {
      return 'Navegador de iOS detectado.';
    }
    return 'Estado del permiso: default.';
  };

  return (
    <div className='flex flex-col items-center justify-center h-screen'>
      <div className='border-2 border-black p-8 space-y-4 flex items-center justify-center flex-col'>
        <h1 className='text-2xl font-bold'>
          Prueba de Notificaciones Automáticas
        </h1>
        {getPermissionMessage() && (
          <p className='text-lg text-red-600'>
            <strong>{getPermissionMessage()}</strong>
          </p>
        )}
        <h2 className='text-xl'>
          Tiempo restante: <strong>{formatTime(timeLeft)}</strong>
        </h2>
        <button
          className='bg-blue-700 text-white w-96 p-2 rounded-md'
          onClick={startTimer}
          disabled={isRunning}
        >
          Iniciar Temporizador
        </button>
        <button
          className='bg-gray-700 text-white w-96 p-2 rounded-md'
          onClick={resetTimer}
          disabled={timeLeft === 30 && !isRunning}
        >
          Reiniciar Temporizador
        </button>
      </div>
      <div className='mt-4 border-t-2 border-black w-full max-w-xl p-4'>
        <h3 className='text-lg font-bold'>Logs:</h3>
        <ul className='list-disc pl-6'>
          {logs.map((log, index) => (
            <li key={index} className='text-sm'>
              {log}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
