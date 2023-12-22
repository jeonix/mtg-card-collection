import Link from "next/link";

const links = [
    { href: "/", text: "Home", span: "home"},
    { href: "/collection", text: "Collection", span: "collection"},
    { href: "/upload", text: "Upload", span: "upload"},
];

const Navbar = () => {
    return (
        <div className="w-full mx-auto mb-2 border-teal-300 bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500">
            <nav>
                <ul className="flex justify-center py-5 rounded-sm bg-opacity-0">
                    {links.map((l) => (
                        <li className="pr-[2.5rem]" key={l.href}>
                            <Link className="text-base text-neutral-300 hover:text-white" href={l.href}>
                            {l.text}
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>
        </div>
    );
};

export default Navbar;