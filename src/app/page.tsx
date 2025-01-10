'use client';
import { useState, useEffect } from 'react';

export default function TimerWithNotifications() {
  const [permission, setPermission] = useState('default'); // Estado para el permiso de notificaciones
  const [timeLeft, setTimeLeft] = useState(60); // Tiempo restante en segundos (1 minuto)
  const [isRunning, setIsRunning] = useState(false); // Estado para controlar si el contador está en ejecución

  // Solicitar permiso automáticamente al cargar la página
  useEffect(() => {
    const requestPermissionOnLoad = async () => {
      try {
        if ('Notification' in window) {
          const result = await Notification.requestPermission();
          setPermission(result);
          console.log('Permiso para notificaciones:', result);
        } else {
          console.warn('Tu navegador no soporta notificaciones.');
        }
      } catch (error) {
        console.error('Error al solicitar permiso de notificación:', error);
      }
    };

    requestPermissionOnLoad();
  }, []);

  // Manejar el inicio del contador
  const startTimer = () => {
    if (!isRunning) {
      setIsRunning(true);
    }
  };

  // Manejar el reinicio del temporizador....
  const resetTimer = () => {
    setTimeLeft(60);
    setIsRunning(false);

    // Mostrar una notificación al reiniciar el temporizador
    if (permission === 'granted') {
      new Notification('El temporizador se ha reiniciado', {
        body: 'El temporizador ahora está configurado nuevamente a 1 minuto.',
      });
    } else {
      console.log('El temporizador se ha reiniciado.');
    }
  };

  // Manejar la cuenta regresiva
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prevTime => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false); // Detener el contador
      // Mostrar la notificación al terminar el tiempo
      if (permission === 'granted') {
        new Notification('El tiempo se ha acabado', {
          body: 'Puedes reiniciar el temporizador si lo necesitas.',
        });
      } else {
        console.log('El tiempo se ha acabado.');
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

  return (
    <div className='flex flex-col items-center justify-center h-screen'>
      <div className='border-2 border-black p-8 space-y-4 flex items-center justify-center flex-col'>
        <h1 className='text-2xl font-bold'>
          Prueba de Notificaciones Automáticas
        </h1>
        <p className='text-lg'>
          Estado del permiso: <strong>{permission}</strong>{' '}
        </p>
        <h2 className='text-xl'>
          Tiempo restante: <strong>{formatTime(timeLeft)}</strong>{' '}
        </h2>
        <button
          className='bg-blue-700 text-white w-96 p-2 rounded-md'
          onClick={startTimer}
          disabled={isRunning}
        >
          Iniciar Temporizador
        </button>
        <button
          className='bg-red-600 text-white w-96 p-2 rounded-md'
          onClick={resetTimer}
          disabled={timeLeft === 60 && !isRunning}
        >
          Reiniciar Temporizador
        </button>
      </div>
    </div>
  );
}
