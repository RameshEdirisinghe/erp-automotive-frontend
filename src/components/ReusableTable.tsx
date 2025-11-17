import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { fetchFromBackend } from "../services/DashboardService";

interface TableProps {
  endpoint: string;  
}

const ReusableTable: React.FC<TableProps> = ({ endpoint }) => {
  const [data, setData] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const rowsPerPage = 5;

  
  useEffect(() => {
    fetchFromBackend(endpoint).then((rows) => {
      setData(Array.isArray(rows) ? rows : []);
      setPage(1); 
    });
  }, [endpoint]);

  
  const columns = data.length > 0 ? Object.keys(data[0]) : [];

  const totalPages = Math.ceil(data.length / rowsPerPage);
  const start = (page - 1) * rowsPerPage;
  const currentRows = data.slice(start, start + rowsPerPage);

  return (
    <div className="rounded-2xl bg-[#0f172a] shadow-xl p-6">
      <h2 className="text-xl font-semibold text-white mb-4">Data Table</h2>

      <div className="overflow-x-auto rounded-xl border border-[#334155]">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-[#1e293b] text-gray-200 text-sm">
              {columns.map((col) => (
                <th key={col} className="p-3 text-left">{col}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {currentRows.map((row, idx) => (
              <tr
                key={idx}
                className={`${idx % 2 ? "bg-[#111b2d]" : "bg-[#0f172a]"} hover:bg-[#1e293b]`}
              >
                {columns.map((col) => (
                  <td key={col} className="p-3 text-sm text-gray-300">
                    {String(row[col])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    
      <div className="flex justify-between items-center mt-6">
        <p className="text-gray-400 text-sm">
          Showing {start + 1} – {Math.min(start + rowsPerPage, data.length)} of {data.length}
        </p>

        <div className="flex items-center gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className={`w-8 h-8 flex items-center justify-center rounded-lg ${
              page === 1 ? "text-gray-500" : "text-white bg-blue-600 hover:bg-blue-700"
            }`}
          >
            <ChevronLeft size={18} />
          </button>

          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`w-8 h-8 rounded-lg text-sm ${
                page === i + 1 ? "bg-blue-600 text-white shadow-md" : "text-gray-300 hover:bg-[#1e293b]"
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className={`w-8 h-8 flex items-center justify-center rounded-lg ${
              page === totalPages ? "text-gray-500" : "text-white bg-blue-600 hover:bg-blue-700"
            }`}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReusableTable;
