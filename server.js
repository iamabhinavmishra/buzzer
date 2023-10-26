const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const os = require('os');
const dns = require('dns');

//app.use(express.static(path.join(__dirname, 'public')));

//const PORT = 3000; // The desired port number
//const LOCAL_IP = '192.168.0.164'; // Your local IP address

app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});


const sessions = {}; // Store active sessions

// Function to generate a 5-character session ID
function generateSessionID() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let sessionID = '';
  for (let i = 0; i < 5; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    sessionID += characters.charAt(randomIndex);
  }
  return sessionID;
}

io.on('connection', (socket) => {
  socket.on('createSession', () => {
    const sessionID = generateSessionID();

    // Store the session ID with the user who created it
    socket.sessionID = sessionID;

    // Initialize the list of connected users for the session
    sessions[sessionID] = { connectedUsers: [] };

    // Join a room with the session ID
    socket.join(sessionID);

    // Emit the session ID back to the user
    socket.emit('sessionCreated', sessionID);
  });

  socket.on('joinSession', (data) => {
    const { sessionID, username } = data;
    const session = sessions[sessionID];

    if (session) {
      if (session.connectedUsers.length >= 25) {
        socket.emit('sessionFull');
      } else {
        socket.username = username;
        socket.sessionID = sessionID;

        session.connectedUsers.push(username);

        socket.join(sessionID);

        socket.emit('joinedSession');
        socket.emit('showBuzzButton');

        // Emit the updated list of connected users to everyone in the session
        io.to(sessionID).emit('connectedUsersList', session.connectedUsers);
      }
    } else {
      socket.emit('sessionDoesNotExist');
    }
  });

  // Handle the "Buzz" button press
  socket.on('buzzPressed', (username) => {
    const session = sessions[socket.sessionID];

    if (session) {
      io.to(socket.sessionID).emit('buttonClicked', username);
    }
  });


  socket.on('clearBuzzers', () => {
    // Emit a "clearBuzzers" event to all clients
    io.emit('clearBuzzers');
  });

});




//server.listen(3000, () => {
//  console.log('Server is running on http://localhost:3000');
//});


// server.listen(PORT, LOCAL_IP, () => {
//   console.log(`Server is running on http://${LOCAL_IP}:${PORT}`);
// });


server.listen(3000, () => {
  const networkInterfaces = os.networkInterfaces();
  const interfaces = Object.keys(networkInterfaces);

  // Find the first IPv4 address (ignore 127.0.0.1)
  let ipAddress = '';
  for (let i = 0; i < interfaces.length; i++) {
    const addresses = networkInterfaces[interfaces[i]];
    for (let j = 0; j < addresses.length; j++) {
      if (addresses[j].family === 'IPv4' && addresses[j].address !== '127.0.0.1') {
        ipAddress = addresses[j].address;
        break;
      }
    }
    if (ipAddress) {
      break;
    }
  }

  // If no IPv4 address is found, use DNS to get the public IP
  if (!ipAddress) {
    dns.lookup(os.hostname(), (err, addr) => {
      if (!err) {
        ipAddress = addr;
      }
      console.log(`Server is running at http://${ipAddress}:3000/`);
    });
  } else {
    console.log(`Server is running at http://${ipAddress}:3000/`);
  }
});