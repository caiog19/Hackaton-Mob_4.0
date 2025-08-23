const express = require('express');
const router = express.Router();
const { Client } = require('@googlemaps/google-maps-services-js');

const client = new Client({});

router.post('/plan', async (req, res) => {
  const { origin, destination } = req.body;

  if (!origin || !destination) {
    return res.status(400).json({ error: 'Origin and destination are required.' });
  }

  try {
    const response = await client.directions({
      params: {
        origin: origin,      
        destination: destination, 
        mode: 'transit',    
        transit_routing_preference: 'less_walking',
        language: 'pt-BR',
        key: process.env.GOOGLE_MAPS_API_KEY, 
      },
    });

    const formattedRoutes = response.data.routes.map(route => {
      const leg = route.legs[0];
      const transitStep = leg.steps.find(step => step.travel_mode === 'TRANSIT');
      
      return {
        id: route.summary + leg.duration.value,
        duration: leg.duration.text,
        arrival: leg.arrival_time?.text, 
        line: transitStep ? transitStep.transit_details.line.short_name : 'N/A',
      }
    });

    res.json({ routes: formattedRoutes });

  } catch (e) {
    console.error(e.response ? e.response.data.error_message : e.message);
    res.status(500).json({ error: 'Failed to fetch routes from Google Maps API.' });
  }
});

module.exports = router;