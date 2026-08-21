export interface MostPurchasedProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  rating: number;
  reviewCount: number;
}

export const mostPurchasedProducts: MostPurchasedProduct[] = [
  {
    id: "1",
    name: "Modern Chair",
    category: "Furniture",
    price: 1299,
    image: "catogeries/1.jpg",
    rating: 4.9,
    reviewCount: 128,
  },
  {
    id: "2",
    name: "Classic Table",
    category: "Furniture",
    price: 1499,
    image: "catogeries/2.jpg",
    rating: 4.7,
    reviewCount: 94,
  },
  {
    id: "3",
    name: "Designer Lamp",
    category: "Lighting",
    price: 999,
    image: "catogeries/3.jpg",
    rating: 4.8,
    reviewCount: 76,
  },
  {
    id: "4",
    name: "Premium Sofa",
    category: "Furniture",
    price: 1799,
    image: "catogeries/4.jpg",
    rating: 4.6,
    reviewCount: 61,
  },
];