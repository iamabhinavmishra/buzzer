const socket = io();
const joinForm = document.getElementById('joinForm');
const sessionIDInput = document.getElementById('sessionIDInput');
const usernameInput = document.getElementById('usernameInput');
const buzzButton = document.getElementById('buzzButton');
const sessionUsernames = new Set(); // Keep track of usernames in the session

const clearBuzzersButton = document.getElementById('clearBuzzersButton');



let buzzed = false; // Track if the user has already buzzed

joinForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const sessionID = sessionIDInput.value.trim();
  const username = usernameInput.value.trim();

  if (sessionID && username) {
    if (sessionUsernames.has(username)) {
      alert('User with the same username is already in the session.');
    } else {
      socket.emit('joinSession', { sessionID, username });
            // Disable the form elements after joining
            sessionIDInput.disabled = true;
            usernameInput.disabled = true;
            joinForm.querySelector('button[type="submit"]').disabled = true;
    }
  }
});

socket.on('sessionFull', () => {
  alert('Session is full. You cannot join.');
});

socket.on('joinedSession', () => {
  // Enable the "Buzz" button when the user joins
  buzzButton.style.display = 'block';
  buzzButton.disabled = false;
  buzzButton.style.backgroundColor = 'green';
});

buzzButton.addEventListener('click', () => {
  if (!buzzed) {
    // Emit an event when the "Buzz" button is clicked
    socket.emit('buzzPressed', usernameInput.value.trim());
    buzzed = true; // Mark the user as buzzed
    buzzButton.disabled = true; // Disable the "Buzz" button
    buzzButton.style.backgroundColor = 'red';
  } else {
    alert('You have already buzzed!');
  }
});

// clearBuzzersButton.addEventListener('click', () => {
//   // Enable the "Buzz" button
//   buzzButton.disabled = false;
//   // Clear the button click order list
//   buttonClickOrderList.innerHTML = '';
// });


socket.on('clearBuzzers', () => {
  // Enable the "Buzz" button
  buzzButton.disabled = false;
  buzzButton.style.backgroundColor = 'green';
  buzzed = false;
  // Clear the button click order list
  //buttonClickOrderList.innerHTML = '';
});