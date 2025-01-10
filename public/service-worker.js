self.addEventListener('install', (event) => {
    console.log('Service Worker instalado.');
    // Realiza tareas iniciales si es necesario
  });
  
  self.addEventListener('activate', (event) => {
    console.log('Service Worker activado.');
    // Realiza tareas de limpieza o activación si es necesario
  });
  
  self.addEventListener('notificationclick', (event) => {
    console.log('Notificación clicada:', event);
    event.notification.close(); // Cierra la notificación al hacer clic
    // Puedes agregar lógica para redirigir o manejar la acción
  });
  