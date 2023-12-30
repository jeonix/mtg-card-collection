'use client'
import { useState, useEffect } from 'react';
import Link from 'next/link';

export async function fetchSetCards({ set, page = 1 }) {
  const setCode = set;

  // Fetch cards data for the specific set and page
  const response = await fetch(`https://api.scryfall.com/cards/search?q=set:${setCode}&page=${page}`);
  const data = await response.json();
  const cards = data.data;

  return { cards, hasMore: data.has_more, nextPage: data.next_page };
}

export default function Page({ params }) {
  const [cardPages, setCardPages] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchInitialCards = async () => {
      const { cards, hasMore, nextPage } = await fetchSetCards(params);
      setCardPages([{ cards, hasMore, nextPage }]);
      setCurrentPage(1);
    };

    fetchInitialCards();
  }, [params]);

  const loadMoreCards = async () => {
    const { cards, hasMore, nextPage } = await fetchSetCards({ ...params, page: currentPage + 1 });
    setCardPages((prevPages) => [...prevPages, { cards, hasMore, nextPage }]);
    setCurrentPage(currentPage + 1);
  };

  return (
    <div className="max-w-full mx-auto flex flex-col items-center">
      <div className="flex items-center justify-between w-full"> {/* Added justify-between for spacing */}
        <Link href={'/sets'}>
          <p className='m-1 bg-red-400 text-white p-1 rounded'>Go back to sets</p>
        </Link>
        <h1 className='text-center font-bold text-2xl p-1 m-0'>Cards in Set: {cardPages[0]?.cards[0]?.set_name}</h1>
        <div className="w-1/6">
        </div>
      </div>
      {cardPages.map((page, pageIndex) => (
        <div key={pageIndex} className="max-w-full mx-auto flex flex-col items-center">
          <h2 className='font-bold text-lg'>Number of Cards Retrieved (Page {pageIndex + 1}): {page.cards.length}</h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {page.cards.map((card) => (
              <li key={card.id} className="p-2 m-2 border-solid border-red-400 rounded-xl border-2 md">
                <p>Card Name: {card.name}</p>
                <p>Set Name: {card.set_name}</p>
                <p>Type: {card.type_line}</p>
                <p>Collector Number: {card.collector_number}</p>
                <p>Released: {card.released_at}</p>
                <p>Current Market Price: ${card.prices.usd}</p>
              </li>
            ))}
          </ul>
        </div>
      ))}
      {cardPages.length > 0 && cardPages[cardPages.length - 1].hasMore && (
        <button onClick={loadMoreCards} className="mt-4 bg-blue-500 text-white p-2 rounded">
          Load More
        </button>
      )}
    </div>
  );
}