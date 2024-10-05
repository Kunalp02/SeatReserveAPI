const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const connectDB = require('./db');
const seatRoutes = require('./routes/seats'); 

const app = express();

app.use(express.json());
app.use(cors()); 

connectDB();

const Seat = require('./models/Seat');

const initializeSeats = async () => {
  const seatCount = await Seat.countDocuments({});

  if (seatCount === 0) {
    console.log('Initializing seats in the database...');
    for (let row = 1; row <= 11; row++) {
      for (let seat = 1; seat <= 7; seat++) {
        await Seat.create({
          seatNumber: (row - 1) * 7 + seat,
          row: row,
          isBooked: false
        });
      }
    }

    for (let seat = 1; seat <= 3; seat++) {
      await Seat.create({
        seatNumber: 77 + seat,
        row: 12,
        isBooked: false
      });
    }

    console.log('Seats initialized.');
  } else {
    console.log('Seats are already initialized.');
  }
};

initializeSeats();

app.use('/api/seats', seatRoutes);

app.get('/', (req, res) => {
  res.send('Train Seat Booking API is running.');
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
