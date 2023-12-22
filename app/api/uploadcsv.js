import { PrismaClient } from '@prisma/client';
import Papa from 'papaparse';
import express from 'express';
import fileUpload from 'express-fileupload';
import axios from 'axios';

const prisma = new PrismaClient();
const router = express.Router();

router.use(fileUpload());

router.post('/', async (req, res) => {
  try {
    const file = req.files && req.files.file;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const parsedData = await parseCSV(file);
    const updatedData = await updateDatabaseWithAPIInfo(parsedData);

    return res.status(200).json({ message: 'CSV file uploaded and processed successfully', updatedData });
  } catch (error) {
    console.error('Error processing CSV file:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

async function parseCSV(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file.data.toString(), {
      complete: (results) => resolve(results.data),
      error: (error) => reject(error),
      header: true,
    });
  });
}

async function updateDatabaseWithAPIInfo(parsedData) {
  const updatedData = [];

  for (const row of parsedData) {
    try {
      const cardNameParam = row.Card.replace(/-/g, '+');
      const url = `https://api.scryfall.com/cards/named?fuzzy=${cardNameParam}`;

      const response = await axios.get(url);
      const cardData = response.data;

      const updatedCard = await prisma.card.upsert({
        where: { name: row.Card },
        update: {
          set: cardData.set_name,
          tcgplayer_id: cardData.tcgplayer_id,
          price: cardData.prices?.usd ? parseFloat(cardData.prices.usd) : null,
          // Add more properties as needed
        },
        create: {
          name: row.Card,
          set: cardData.set_name,
          tcgplayer_id: cardData.tcgplayer_id,
          price: cardData.prices?.usd ? parseFloat(cardData.prices.usd) : null,
          // Add more properties as needed
        },
      });

      updatedData.push(updatedCard);
    } catch (error) {
      console.error(`Error updating database for card "${row.Card}":`, error);
      // You may choose to handle errors for individual cards here
    }
  }
  console.log(updatedData);
  return updatedData;
}

export default router;