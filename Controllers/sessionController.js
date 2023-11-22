const express = require('express');
const Session = require('../Models/session');

const getFreeSessions = async (req, res) => {
  try {
    const freeSessions = await Session.find({ status: 'free' });

    const formattedSessions = freeSessions.map(session => ({
      wardenId: session.wardenId,
      dayOfWeek: session.dayOfWeek,
      time: session.time,
      slotDetails: session.slotDetails,
      status: session.status,
    }));

    res.json(formattedSessions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const bookSession = async (req, res) => {
  try {
    const { wardenId, dayOfWeek, time, slotDetails } = req.body;

    const session = new Session({
      wardenId,
      dayOfWeek,
      time,
      slotDetails,
      status: 'booked',
    });

    await session.save();

    const updatedSlot = await Session.findOneAndUpdate(
      { wardenId, dayOfWeek, time, status: 'free' },
      { status: 'booked' },
      { new: true } // To return the updated document
    );

    res.json({ message: 'Session booked successfully', bookedSession: session, updatedSlot });
  } catch (error) {
    console.error('Error booking session:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getPendingSessions = async (req, res) => {
  try {
    const wardenId = req.user.wardenId; 

    const pendingSessions = await Session.find({ wardenId, status: 'pending' });

    res.json(pendingSessions);
  } catch (error) {
    console.error('Error fetching pending sessions:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const hardcodedSessions = [
  { wardenId: 'B', dayOfWeek: 4, time: '10:00', slotDetails: 'Slot A', status: 'free' },
  { wardenId: 'B', dayOfWeek: 5, time: '10:00', slotDetails: 'Slot B', status: 'free' },
];

const addSessions = async (req, res) => {
  try {
    const insertedSessions = await Session.create(hardcodedSessions);

    res.json({ message: 'Hardcoded sessions added to the database', insertedSessions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getFreeSessions,
  bookSession,
  getPendingSessions,
  addSessions
};
