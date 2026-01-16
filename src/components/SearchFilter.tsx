import React from "react";

interface SearchFilterProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
}

const SearchFilter: React.FC<SearchFilterProps> = ({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
}) => {
  return (
    <div
      className="
        w-full 
        rounded-xl 
        bg-[#1e293b]/70 
        border border-[#334155] 
        shadow-lg 
        p-5 
        flex flex-wrap items-center gap-4
      "
    >
      <input
        type="text"
        placeholder="Search products..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="
          flex-1 
          bg-[#0f172a] 
          border border-[#334155] 
          rounded-full 
          px-4 py-2 
          text-sm text-gray-200 
          placeholder:text-gray-400
          focus:outline-none 
          focus:ring-2 focus:ring-blue-500/50 
          transition
        "
      />

      <select
        value={selectedCategory}
        onChange={(e) => onCategoryChange(e.target.value)}
        className="
          bg-[#0f172a] 
          border border-[#334155] 
          rounded-full 
          px-4 py-2 
          text-sm 
          text-gray-200 
          focus:outline-none 
          focus:ring-2 focus:ring-blue-500/50
        "
      >
        <option value="all">All Categories</option>
        <option value="engine">Engine Parts</option>
        <option value="body">Body Kits</option>
        <option value="brake">Brake Systems</option>
        <option value="electrical">Electrical</option>
      </select>

     {/* 
      <button
        className="
          bg-blue-600 
          text-white 
          px-5 py-2 
          rounded-full 
          text-sm 
          font-medium
          hover:bg-blue-500 
          transition 
          shadow-md 
          hover:shadow-blue-500/30
        "
      >
        More Filters
      </button>
      */}
      
    </div>
  );
};

export default SearchFilter;