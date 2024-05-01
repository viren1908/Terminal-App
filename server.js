const express = require('express');
const http = require('http'); 
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server);

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Socket handling
io.on('connection', (socket) => {
    console.log('A new user has been connected', socket.id);

    socket.on('user-message', (message) => {
        console.log("A new User Message", message);
        // Check if the message is a command
        if (message.startsWith('command:')) {
            const command = message.substring(8).trim(); // Remove 'command:' prefix
            console.log('Executing command:', command);
            // Execute the command
            const { exec } = require('child_process');
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    socket.emit('response', { error: error.message });
                    return;
                }
                if (stderr) {
                    socket.emit('response', { error: stderr });
                    return;
                }
                socket.emit('response', { output: stdout });
            });
        }
    });
});

// Start the server
const PORT =  9000;
server.listen(PORT, () => console.log(`Server started at PORT: ${PORT}`));
