const socket = io('https://realtime-device-track-gamma.vercel.app',{
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
  });

  socket.on('connect', () => {
    console.log('Connected to server with ID:', socket.id);
  });

  socket.on('connect', () => {
    console.log('Connected to server with ID:', socket.id);
  });

  // Handle WebSocket errors
  socket.on('connect_error', (error) => {
    console.error('WebSocket connection error:', error);
  });

  socket.on('connect_timeout', () => {
    console.error('WebSocket connection timed out');
  });

if (navigator.geolocation) {
    navigator.geolocation.watchPosition(
        (position) => {
        const { latitude, longitude } = position.coords;
        socket.emit('send-location', {
            latitude, longitude
        });
    },
     (error) => {
        console.log("Error: ", error)
    }, {
        enableHighAccuracy: true,
        timeout:5000,
        maximumAge: 0,
    });
}

const map = L.map("map").setView([0, 0],10);



L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{
    attribution:"https://github.com/gmahur7"
}).addTo(map)

const markers = {

}

socket.on("recieve-location",(data)=>{
    console.log('Location received:', data);
    const {id,latitude,longitude} =data;
    map.setView([latitude,longitude],16)
    if(markers[id]){
        markers[id].setLatLng([latitude,longitude])
    }
    else{
        markers[id]=L.marker([latitude,longitude]).addTo(map);
    }
})

socket.on("user-disconnected",((id)=>{
    if(markers[id]){
        map.removeLayer(markers[id]);
        delete markers[id]
    }
}))

socket.on('disconnect', () => {
    console.log('Disconnected from server');
  });