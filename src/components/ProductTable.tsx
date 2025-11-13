import React from "react";

interface Product {
  name: string;
  supplier: string;
  code: string;
  quantity: number;
  price: string;
  date: string;
}

interface Props {
  products: Product[];
}

const ProductTable: React.FC<Props> = ({ products }) => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <table className="w-full text-sm text-left border-collapse">
        <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
          <tr>
            <th className="px-4 py-3">Product Name</th>
            <th className="px-4 py-3">Supplier</th>
            <th className="px-4 py-3">Product Code</th>
            <th className="px-4 py-3">Quantity</th>
            <th className="px-4 py-3">Price</th>
            <th className="px-4 py-3">Date</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p, i) => (
            <tr
              key={i}
              className="border-t hover:bg-gray-50 transition-colors"
            >
              <td className="px-4 py-3">{p.name}</td>
              <td className="px-4 py-3">{p.supplier}</td>
              <td className="px-4 py-3">{p.code}</td>
              <td className="px-4 py-3">{p.quantity}</td>
              <td className="px-4 py-3">{p.price}</td>
              <td className="px-4 py-3">{p.date}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="p-4 text-sm text-gray-600 border-t">
        Showing {products.length} of {products.length}
      </div>
    </div>
  );
};

export default ProductTable;
