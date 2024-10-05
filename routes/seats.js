const express = require('express');
const router = express.Router();
const Seat = require('../models/Seat');

const findAvailableSeats = async (numSeats) => {
  let availableSeats = [];

  for (let row = 1; row <= 12; row++) {
    let rowSeats = await Seat.find({ row: row, isBooked: false });

    if (rowSeats.length >= numSeats) {
      availableSeats = rowSeats.slice(0, numSeats).map(s => s.seatNumber);
      break;
    }
  }

  if (availableSeats.length === 0) {
    availableSeats = (await Seat.find({ isBooked: false }))
                      .slice(0, numSeats)
                      .map(s => s.seatNumber);
  }

  return availableSeats;
};

router.get('/', async (req, res) => {
  try {
    const seats = await Seat.find({});
    res.json({ seats });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching seats', error });
  }
});

router.post('/book', async (req, res) => {
  const { numSeats } = req.body;

  if (numSeats < 1 || numSeats > 7) {
    return res.status(400).json({ message: 'You can only book between 1 and 7 seats.' });
  }

  try {
    const availableSeats = await findAvailableSeats(numSeats);

    if (availableSeats.length < numSeats) {
      return res.status(400).json({ message: 'Not enough seats available.' });
    }

    await Seat.updateMany(
      { seatNumber: { $in: availableSeats } },
      { $set: { isBooked: true } }
    );

    res.json({ message: `Seats ${availableSeats.join(', ')} have been successfully booked!` });
  } catch (error) {
    res.status(500).json({ message: 'Error booking seats', error });
  }
});

module.exports = router;
