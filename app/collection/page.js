import React from "react";
import prisma from '../../lib/prisma';

async function getCardsFromDB() {
  try {
    const cards = await prisma.card.findMany();
    return {
      props: {
        cards,
      },
    };
  } catch (error) {
    console.error('Error fetching cards:', error);
    return {
      props: {
        cards: [],
      },
    };
  }
}

export default async function Page() {

  async function updatePrices() {
    'use server'
    const res = await getCardsFromDB();
    const cards = res.props.cards;
    try {
      await Promise.all(cards.map(async (card) => {
        try {
          const url = `https://api.scryfall.com/cards/tcgplayer/${card.tcgplayer_id}`;
          const res = await fetch(url);
          const cardData = await res.json();
          card.price = cardData.prices.usd;
          const existingCard = await prisma.card.findFirst({
            where: {
              name: card.name,
              set: card.set,
            },
          });
          if (existingCard) {
            const updatedCard = await prisma.card.update({
              where: { id: existingCard.id },
              data: { price: card.price },
            });
            return updatedCard;
          }
        } catch {
          console.log(`Error fetching card ${card.name} current price`)
        }
      }));
    } catch (error) {
      console.log(`Error updating Prices: ${error}`)
    }
    return cards;
  }

  const cards = await updatePrices();

  const cardCount = cards.length;
  const totalValue = cards.reduce((sum, card) => sum + (parseFloat(card.price || 0) * card.quantity), 0);
  const uniqueSets = [...new Set(cards.map(card => card.set))];

  return (
    <div className="max-w-full mx-auto flex flex-row">
      {/* Display unique sets in a column on the left */}
      <div className="flex flex-col">
        <h2 className="font-bold text-lg text-center m-1">Sets:</h2>
        <ul className="list-none p-0 m-0">
          {uniqueSets.map((set, index) => (
            <li key={index} className="p-2 m-2 border-solid rounded-xl border-2 border-red-400 md">{set}</li>
          ))}
        </ul>
      </div>

      {/* Display cards in a grid on the right */}
      <div className="flex flex-col items-center">
        <h1 className='text-center font-bold text-2xl p-1 m-0 ml-4'>Card Collection</h1>
        <h3 className="font-bold text-lg">Number of Cards in DB: {cardCount} -- Total Value: ${totalValue.toFixed(2)}</h3>
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-1 mt-1">
          {cards.map((card, index) => (
            <li key={index} className="p-2 m-2 border-solid rounded-xl border-2 border-red-400 md">
              <p>Name: {card.name}</p>
              <p>Set: {card.set}</p>
              <p>Price: ${card.price.toString()} -- Quantity: {card.quantity}</p>
              <p>Collector Number: {card.collector_number}</p>
              <p>Card Market ID: {card.cardmarket_id}</p>
              <p>TCG Player ID: {card.tcgplayer_id}</p>
              <p>Release Date: {card.released_at.toLocaleString()}</p>
              <p>Added to the database: {card.createdAt.toLocaleDateString()}</p>
              <p>Price updated: {card.updatedAt.toLocaleDateString()}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};