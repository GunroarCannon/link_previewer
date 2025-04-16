const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
app.use(cors());

// API endpoint: /preview?url=YOUR_URL
app.get('/preview', async (req, res) => {
  try {
    const url = req.query.url;
    if (!url) return res.status(400).json({ error: "URL parameter missing" });

    const response = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' } // Avoid bot blocking
    });
    const html = response.data;
    const $ = cheerio.load(html);

    const getMetaTag = (name) => $(`meta[property="og:${name}"]`).attr('content') 
                              || $(`meta[name="twitter:${name}"]`).attr('content');

    const preview = {
      title: getMetaTag('title') || $('title').text() || url,
      description: getMetaTag('description') || $('meta[name="description"]').attr('content'),
      image: getMetaTag('image'),
      url: url
    };

    res.json(preview);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch preview" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API running on port ${PORT}`));
