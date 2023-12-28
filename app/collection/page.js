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
    const res = await getCardsFromDB();
    const cards = res.props.cards;
    const totalValue = cards.reduce((sum, card) => sum + (parseFloat(card.price || 0) * card.quantity), 0);
    return (
      <div className="max-w-screen-lg mx-auto flex flex-col items-center">
        <div className="flex flex-row items-center">
          {/* Display total value to the right of the h1 element */}
          <h1 className='text-center font-bold text-2xl p-1 m-0'>
            Card Collection
          </h1>
          <p className="text-xl font-semibold ml-4">
            Total Value: ${totalValue.toFixed(2)}
          </p>
        </div>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {cards.map((card, index) => (
            <li key={index} className="p-2 m-2 border-solid rounded-xl border-2 md">
              <p>Name: {card.name}</p>
              <p>Set: {card.set}</p>
              <p>Price: ${card.price.toString()} -- Quantity: {card.quantity}</p>
              <p>Card Market ID: {card.cardmarket_id}</p>
              <p>TCG Player ID: {card.tcgplayer_id}</p>
              <p>Release Date: {card.released_at.toLocaleString()}</p>
              <p>Added to the database: {card.createdAt.toLocaleDateString()}</p>
              <p>Price updated: {card.updatedAt.toLocaleDateString()}</p>
            </li>
          ))}
        </ul>
      </div>
    );
};