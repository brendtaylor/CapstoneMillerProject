const express = require('express');
const app = express();

//**************************************************************************************//
// Get requests                                                                         //
//**************************************************************************************//

// Route for listing all of the tickets
app.get('/tickets', function (req, res) {
  res.send('Hello World');
  app.status(200).json({ message: 'Succesfully retrived all tickets' });
});

//Health check endpoint
app.get('/health', function (req, res) {
  const healthcheck = {
    uptime: process.uptime(), // Application uptime in seconds
    message: 'OK',
    timestamp: Date.now(),
    // connection to database
    // memory usage
  };
  try {
    res.status(200).json(healthcheck);
  } catch (error) {
    healthcheck.message = error.message;
    res.status(503).json(healthcheck); // Service Unavailable
  }
});

//Retrive single ticket by ticket ID
app.get('/tickets/:id', function (req, res) {
  res.send('Hello World');
  app.status(200).json({ message: 'Ticket response' });
  app.status(404).json({ message: 'Ticket not found' });
});

//**************************************************************************************//
// Post requests                                                                        //
//**************************************************************************************//

// Route for creating a new ticket
app.post('/tickets', function (req, res) {
  res.send('Hello World');
  app.status(201).json({ message: 'Id of hte ticket you created' });
  app.status(404).json({ message: 'Invalid Input' });
});

//**************************************************************************************//
// delete requests                                                                      //
//**************************************************************************************//

// Route for archiving a ticket by ticket ID
app.delete('/tickets/:id', function (req, res) {
  res.send('Hello World');
  app.status(200).json({ message: 'Ticket successfully archived' });
  app.status(404).json({ message: 'Ticket not found' });
});