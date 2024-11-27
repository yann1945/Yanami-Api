const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const translate = require('google-translate-api');

const app = express();
const PORT = process.env.PORT || 3000;

async function quotePopular() {
    const ress = await axios.get('https://www.goodreads.com/quotes');
    const $ = cheerio.load(ress.data);
    const quotes = [];

    const quotePromises = $('.quote').map((i, element) => {
        const quoteText = $(element).find('.quoteText').text().trim();
        const author = $(element).find('.authorOrTitle').text().trim();

        return translate(quoteText, { to: 'id' })
            .then(res => ({
                quote: res.text.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim(),
                author: author
            }))
            .catch(err => {
                console.error('Error while translating:', err);
                return { quote: quoteText, author: author };
            });
    }).get();

    const translatedQuotes = await Promise.all(quotePromises);
    return translatedQuotes;
}

// Endpoint untuk mendapatkan kutipan
app.get('/quotes', async (req, res) => {
    try {
        const quotes = await quotePopular();
        res.json(quotes);
    } catch (error) {
        console.error('Error fetching quotes:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
