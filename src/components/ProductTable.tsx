import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getTableData } from "../services/DashboardService";

const ProductTable: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const rowsPerPage = 5;

  useEffect(() => {
    const loadData = async () => {
      const rows = await getTableData();
      setData(rows);
    };
    loadData();
  }, []);

  const totalPages = Math.ceil(data.length / rowsPerPage);

  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;

  const currentRows = data.slice(startIndex, endIndex);

  const columns = ["Column A", "Column B", "Column C", "Column D", "Column E"];

  return (
    <div className="rounded-2xl bg-[#0f172a] shadow-xl p-6">
      <h2 className="text-xl font-semibold text-white mb-4">Data Table</h2>

      <div className="overflow-x-auto rounded-xl border border-[#334155]">
        <table className="min-w-full border-collapse">

          
          <thead>
            <tr className="bg-[#1e293b] text-gray-200 text-sm">
              {columns.map((col, index) => (
                <th key={index} className="p-3 text-left">{col}</th>
              ))}
            </tr>
          </thead>

          
          <tbody>
            {currentRows.map((row, rowIdx) => (
              <tr
                key={rowIdx}
                className={`
                  ${rowIdx % 2 === 0 ? "bg-[#0f172a]" : "bg-[#111b2d]"}
                  hover:bg-[#1e293b] transition text-gray-300
                `}
              >
                <td className="p-3 text-sm">{row.col1}</td>
                <td className="p-3 text-sm text-gray-400">{row.col2}</td>
                <td className="p-3 text-sm text-gray-400">{row.col3}</td>
                <td className="p-3 text-sm text-gray-400">{row.col4}</td>
                <td className="p-3 text-sm text-gray-400">{row.col5}</td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>

     
      <div className="flex justify-between items-center mt-6 px-1">

       
        <p className="text-gray-400 text-sm">
          Showing {startIndex + 1} to {Math.min(endIndex, data.length)} of {data.length} results
        </p>

        
        <div className="flex items-center gap-2">

        
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className={`
              w-8 h-8 flex items-center justify-center rounded-lg
              ${currentPage === 1 ? "text-gray-600" : "text-white bg-[#1e40af] hover:bg-[#1e3a8a]"}
            `}
          >
            <ChevronLeft size={18} />
          </button>

          
          {Array.from({ length: totalPages }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentPage(index + 1)}
              className={`
                w-8 h-8 flex items-center justify-center rounded-lg text-sm
                ${currentPage === index + 1
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-gray-300 hover:bg-[#1e293b]"}
              `}
            >
              {index + 1}
            </button>
          ))}

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className={`
              w-8 h-8 flex items-center justify-center rounded-lg
              ${currentPage === totalPages ? "text-gray-600" : "text-white bg-[#1e40af] hover:bg-[#1e3a8a]"}
            `}
          >
            <ChevronRight size={18} />
          </button>

        </div>
      </div>

    </div>
  );
};

export default ProductTable;
