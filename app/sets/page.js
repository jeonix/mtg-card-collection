import Link from "next/link";

async function fetchSets() {
  const response = await fetch('https://api.scryfall.com/sets');
  const sets = await response.json();
  return sets.data;
}

export default async function Page() {
  const sets = await fetchSets();
  return (
    <div className="max-w-screen-lg mx-auto flex flex-col items-center">
      <h1 className='text-center font-bold text-2xl p-1 m-0'>Available Sets</h1>
      <h3 className='font-bold text-lg'>click on a set to view its cards</h3>
      <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-1 mt-1">
        {sets.map((set) => (
          <li key={set.code} className="p-2 m-2 border-solid border-red-400 rounded-xl border-2 md">
            <Link href={`/sets/${set.code}`}>
              <p>{set.name}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}