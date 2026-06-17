const SkeletonCard = () => {
    return (
        <div className="flex flex-col bg-gray-800 p-5 rounded-xl border border-gray-700 border-l-4 border-l-gray-600 shadow-sm animate-pulse h-[160px]">
            <div className="flex justify-between items-start mb-4">
                <div className="h-5 bg-gray-700 rounded-md w-2/3"></div>
                <div className="h-5 bg-gray-700 rounded-md w-12"></div>
            </div>
            <div className="space-y-2 mb-4">
                <div className="h-3 bg-gray-700 rounded w-full"></div>
                <div className="h-3 bg-gray-700 rounded w-4/5"></div>
            </div>
            <div className="flex gap-4 mt-auto">
                <div className="h-4 bg-gray-700 rounded w-16"></div>
                <div className="h-4 bg-gray-700 rounded w-24"></div>
            </div>
        </div>
    );
};

export default SkeletonCard;
