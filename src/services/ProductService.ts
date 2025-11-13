export const getDashboardStats = () => {
  return [
    {
      title: "Total Sales",
      value: "$120,000",
      subtitle: "1 month indicator",
      color: "bg-gradient-to-r from-blue-500 to-indigo-500",
    },
    {
      title: "Customers",
      value: "1,200",
      subtitle: "1 month indicator",
      color: "bg-gradient-to-r from-green-400 to-emerald-500",
    },
    {
      title: "Products",
      value: "450",
      subtitle: "1 month indicator",
      color: "bg-gradient-to-r from-purple-500 to-pink-500",
    },
  ];
};

export const getProducts = () => {
  return [
    {
      name: "Brake Pad Set",
      supplier: "Nippon Auto Parts Co.",
      code: "JPN-SPR-2001",
      quantity: 8,
      price: "LKR 39500",
      date: "20.09.2025",
    },
    {
      name: "Engine Oil Filter",
      supplier: "Tokyo Motors Ltd.",
      code: "JPN-SPR-2002",
      quantity: 3,
      price: "LKR 17900",
      date: "19.09.2025",
    },
    {
      name: "Radiator Fan",
      supplier: "Yamato Spare Traders",
      code: "JPN-SPR-2003",
      quantity: 0,
      price: "LKR 68500",
      date: "18.09.2025",
    },
    {
      name: "Headlight Assembly",
      supplier: "Osaka Auto Imports",
      code: "JPN-SPR-2004",
      quantity: 4,
      price: "LKR 205000",
      date: "18.09.2025",
    },
    {
      name: "Shock Absorber Set",
      supplier: "Kobe Auto Supplies",
      code: "JPN-SPR-2005",
      quantity: 6,
      price: "LKR 138000",
      date: "17.09.2025",
    },
  ];
};
