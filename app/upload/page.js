'use client'
 
import { useRouter } from 'next/navigation'
import { useState } from 'react';
import Papa from 'papaparse';
import axios from 'axios';

const HomePage = () => {
  const router = useRouter();
  const [uploadedFile, setUploadedFile] = useState(null);
  const [cards, setCards] = useState([]);
  const [totalValue, setTotalValue] = useState(0);

  const fetchCardData = async (cards) => {
    try {
      const cardDataList = await Promise.all(
        cards.map(async (card) => {
          const cardNameParam = card.name.replace(/-/g, '+');
          const url = `https://api.scryfall.com/cards/named?fuzzy=${cardNameParam}`;

          try {
            const response = await axios.get(url);
            const cardData = response.data;

            let updatedCard = {
              ...card,
              name: cardData.name,
              set: cardData.set_name,
              tcgplayer_id: cardData.tcgplayer_id,
              cardmarket_id: cardData.cardmarket_id,
              released_at: cardData.released_at,
            };

            if (cardData.prices.usd === null) {
              updatedCard = {
                ...updatedCard,
                price: 0,
                message: 'Card price data unavailable',
              };
            }
            else {
              updatedCard = {
                ...updatedCard,
                price: cardData.prices.usd,
              };
            }
            return updatedCard;
          } 
          catch (error) {
            console.error(`Error fetching data for card "${card.name}":`, error);
            return card;      // Return the original card data in case of an error
          }
        })
      );

      setCards(cardDataList);
      const updatedTotalValue = cardDataList.reduce((acc, curr) => acc + parseFloat(curr.price), 0);
      setTotalValue(updatedTotalValue);
    }
    catch (error) {
      console.error('Error fetching card data:', error);
    }
  };

  const addToDatabase = async () => {
    try {
      const response = await fetch('api/addCards', {
        method: 'POST',
        headers: {'Content-Type': 'application/json',},
        body: JSON.stringify({ cards }),
      });
  
      if (response.ok) {
        console.log('Cards added to the database successfully!');
        router.push('/collection');
      }
      else {
        console.error('Failed to add cards to the database.');
      }
    }
    catch (error) {
      console.error('Error adding cards to the database:', error);
    }
  };
  
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      Papa.parse(file, {
        complete: (results) => {
          if (results.data.length > 1) {
            const headers = results.data[0];
            const cards = results.data.slice(1).map((row) => {
              return {
                name: row[headers.indexOf('Card')],
                set: row[headers.indexOf('Set')],
              };
            });
  
            console.log('Parsed Cards:', cards); // Add this log statement
            fetchCardData(cards);
            setUploadedFile(file);
          }
        },
      });
    }
  };

  return (
    <div className='flex flex-col lg:flex-row'>
      <div className='lg:w-3/8 p-1 m-2 justify-between items-center'>
        <h1 className='w-full justify-between text-center font-bold text-3xl p-1 m-0'>MTG Card Collection</h1>
        <h2 className='font-bold text-xl'>Upload Page</h2>
        <input type="file" onChange={handleFileChange} accept=".csv" />

        {uploadedFile && (
          <div className='p-1 m-0'>
            <h2>Uploaded File Details:</h2>
            <p>File Name: {uploadedFile.name}</p>
            <p>File Size: {uploadedFile.size} bytes</p>
          </div>
        )}
      </div>
      {uploadedFile && (
        <div className='lg:w-5/8 p-1 m-2 justify-between place-items-end'>
        <h1 className='w-full text-center font-bold text-2xl p-1 m-0'>Card List</h1>
        <button className='p-1 m-1 border-solid rounded-lg border-2' onClick={addToDatabase}>Add All Cards to Database</button>
        <h2 className='font-bold text-lg'>Total Value: ${totalValue.toFixed(2)}</h2>
        <ol className='flex-container'>
          {cards.map((card) => (
            <li className='p-2 m-2 border-solid rounded-xl border-2 md' key={card.name}>
              <h3>{card.name.replace(/-/g, ' ')} - {card.set} - ${card.price}</h3>
              <p>TCG Player ID: {card.tcgplayer_id}</p>
              <p>Card Market ID: {card.cardmarket_id}</p>
              <p>Release Date: {card.released_at}</p>
            </li>
          ))}
        </ol>
      </div>
      )}
    </div>
  );
};

export default HomePage;