export async function fetchSetCards({ set }) {

  // Fetch cards data for the specific set
  const response = await fetch(`https://api.scryfall.com/cards/search?q=set:${set}`);
  const res = await response.json();
  
  return {
    res
  };
}

export default async function Page({ params }) {
  const res = await fetchSetCards(params);
  const cards = res.res.data;
  const numCardsRetrieved = cards.length;
  const totalCards = res.res.total_cards;
  const hasMore = res.res.has_more;
  let nextPage = '';
  if (hasMore === true) {
    nextPage = res.res.next_page;
  }

  return (
    <div className="max-w-full mx-auto flex flex-col items-center">
      <h1 className='text-center font-bold text-2xl p-1 m-0'>Set: {cards[0].set_name}</h1>
      <h2 className='font-bold text-lg'>Number of Cards Retrieved: {numCardsRetrieved}</h2>
      <h2 className='font-bold text-lg'>Number of Cards in Set: {totalCards}</h2>
      <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <li key={card.id} className="p-2 m-2 border-solid rounded-xl border-2 md">
            <p>Card Name: {card.name}</p>
            <p>Set: {card.set_name}</p>
            <p>Type Line: {card.type_line}</p>
            <p>Set Type: {card.set_type}</p>
            <p>Collector Number: {card.collector_number}</p>
            <p>Released: {card.released_at}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}