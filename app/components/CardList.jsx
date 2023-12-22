import { useEffect, useState } from 'react';
import axios from 'axios';

const CardList = ({ uploadedFile }) => {
  const [cards, setCards] = useState([]);
  const [totalValue, setTotalValue] = useState(0);

  useEffect(() => {
    const fetchCardData = async () => {
        try {
          const cardDataList = await Promise.all(
            uploadedFile.map(async (card) => {
              const cardNameParam = card.name.replace(/-/g, '+');
              const url = `https://api.scryfall.com/cards/named?fuzzy=${cardNameParam}`;
      
              try {
                const response = await axios.get(url);
                const cardData = response.data;
      
                let updatedCard = {
                  ...card,
                  set: cardData.set_name,
                  tcgId: cardData.tcgplayer_id,
                  cardMktId: cardData.cardmarket_id,
                  releaseDate: cardData.released_at,
                };
      
                if (cardData.prices.usd === null) {
                  updatedCard = {
                    ...updatedCard,
                    price: 0,
                    message: 'Card price data unavailable',
                  };
                } else {
                  updatedCard = {
                    ...updatedCard,
                    price: cardData.prices.usd,
                  };
                }
      
                return updatedCard;
              } catch (error) {
                console.error(`Error fetching data for card "${card.name}":`, error);
                return card; // Return the original card data in case of an error
              }
            })
          );
      
          setCards(cardDataList);
          const updatedTotalValue = cardDataList.reduce((acc, curr) => acc + parseFloat(curr.price), 0);
          setTotalValue(updatedTotalValue);
        } catch (error) {
          console.error('Error fetching card data:', error);
        }
    };

    if (uploadedFile.length > 0) {
      fetchCardData();
    }
  }, [uploadedFile]);

  return (
    <div>
      <h2>Card List</h2>
      <h3>Total Value: ${totalValue.toFixed(2)}</h3>
      <ul>
        {cards.map((card) => (
          <li key={card.name}>
            <h3>{card.name.replace(/-/g, ' ')} - {card.set} - ${card.price}</h3>
            <p>TCG Player ID: {card.tcgId}</p>
            {/* Add more properties as needed */}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CardList;