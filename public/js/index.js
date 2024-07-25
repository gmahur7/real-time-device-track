const socket = io('https://realtime-device-track-gamma.vercel.app', {
    transports: ['polling', 'websocket'],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
  });
  
  socket.on('connect', () => {
    console.log('Connected to server with ID:', socket.id);
  });
  
  socket.on('connect_error', (error) => {
    console.error('Connection error:', error);
  });
  
  socket.on('connect_timeout', () => {
    console.error('Connection timed out');
  });
  
  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
  
  socket.on('reconnect_attempt', (attemptNumber) => {
    console.log('Attempting to reconnect:', attemptNumber);
  });
  
  socket.on('reconnect_failed', () => {
    console.error('Reconnection failed');
  });
  
  if (navigator.geolocation) {
    navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        socket.emit('send-location', { latitude, longitude });
      },
      (error) => {
        console.error("Geolocation error:", error.message);
        // Optionally, inform the user about the error
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );
  } else {
    console.error("Geolocation is not supported by this browser.");
    // Optionally, inform the user that geolocation is not supported
  }
  
  const map = L.map("map").setView([0, 0], 2); // World view
  
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "https://github.com/gmahur7"
  }).addTo(map);
  
  const markers = {};
  
  socket.on("recieve-location", (data) => {
    console.log('Location received:', data);
    const { id, latitude, longitude } = data;
    map.setView([latitude, longitude], 16);
    if (markers[id]) {
      markers[id].setLatLng([latitude, longitude]);
    } else {
      markers[id] = L.marker([latitude, longitude]).addTo(map);
    }
  });
  
  socket.on("user-disconnected", (data) => {
    if (markers[data.id]) {
      map.removeLayer(markers[data.id]);
      delete markers[data.id];
    }
  });
  
  socket.on('disconnect', () => {
    console.log('Disconnected from server');
  });