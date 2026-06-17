import Link from "next/link"

export default function Navbar() {
    return (
        <>
            <div className="flex justify-between items-center h-auto bg-[#0a0a0a] border-b border-[#222222] p-4">
                <Link href="/">
                    <h1 className="text-2xl font-black uppercase tracking-tighter text-white">SquadSync</h1>
                </Link>
                <div className="flex items-center gap-4">
                    <Link href="/projects">
                        <button className="text-sm uppercase tracking-widest border border-[#333333] text-white px-5 py-2 rounded-md hover:border-[#00FF87] hover:text-[#00FF87] transition duration-200">Projects</button>
                    </Link>
                    <Link href="/members">
                        <button className="text-sm uppercase tracking-widest border border-[#333333] text-white px-5 py-2 rounded-md hover:border-[#00FF87] hover:text-[#00FF87] transition duration-200">Members</button>
                    </Link>
                    <Link href="/create-task">
                        <button className="text-sm uppercase tracking-widest bg-[#00FF87] text-black font-bold px-5 py-2 rounded-md hover:bg-[#00cc6a] transition duration-200">Create Task</button>
                    </Link>
                </div>
            </div>
        </>
    );
}