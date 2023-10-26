const socket = io();
const createSessionButton = document.getElementById('createSessionButton');
const joinSessionButton = document.getElementById('joinSessionButton');
const sessionDetails = document.querySelector('.session-details');
const sessionIDSpan = document.getElementById('sessionID');
const connectedUsersList = document.getElementById('connectedUsers');
const buttonClickOrderList = document.getElementById('buttonClickOrder');

const clearBuzzersButton = document.getElementById('clearBuzzersButton');

clearBuzzersButton.addEventListener('click', () => {
  // Emit a "clearBuzzers" event to the server
  socket.emit('clearBuzzers');
});

createSessionButton.addEventListener('click', () => {
  // Emit an event to create a session
  socket.emit('createSession');
});

joinSessionButton.addEventListener('click', () => {
  // Redirect to the 'join.html' page
  window.location.href = 'join.html';
});

// Listen for the 'sessionCreated' event
socket.on('sessionCreated', (sessionID) => {
  // Display session details and disable the "Join Session" button
  sessionDetails.style.display = 'block';
  sessionIDSpan.textContent = sessionID;
  createSessionButton.disabled = true;
  joinSessionButton.disabled = true;
});

socket.on('connectedUsersList', (users) => {
  connectedUsersList.innerHTML = ''; // Clear the existing list
  users.forEach((user) => {
    const li = document.createElement('li');
    li.textContent = user;
    connectedUsersList.appendChild(li);
  });
});

// Listen for the 'buttonClicked' event and update the button click order
socket.on('buttonClicked', (username) => {
  console.log(`${username} pressed the "Buzz" button.`); // Add this logging

  // Update the button click order list
  const buttonClickOrderList = document.getElementById('buttonClickOrder');
  const li = document.createElement('li');
  li.textContent = username;
  buttonClickOrderList.appendChild(li);
});

socket.on('clearBuzzers', () => {
  // Enable the "Buzz" button
  // buzzButton.disabled = false;
  // buzzButton.style.backgroundColor = 'green';
  // buzzed = false;
  //Clear the button click order list
  buttonClickOrderList.innerHTML = '';
});