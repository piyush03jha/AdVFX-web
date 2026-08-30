export interface Product {
  id: string;
  name: string;
  category: string;
  description: string;

  price: number;
  oldPrice?: number;

  rating: number;
  reviewCount: number;

  image: string;
  model: string;

  material: string;
  scale: string;
  height: string;
  base: string;
  packaging: string;
  weight: string;

  badge?: string;
  discount?: string;

  tags?: string[];
}

export const products: Product[] = [
  {
    id: "1",
    name: "Cyberpunk Warrior",
    category: "Gaming",
    description: "A highly detailed physical cyberpunk warrior collectible, crafted for display with a premium finish.",
    price: 1499,
    oldPrice: 1999,
    rating: 4.8,
    reviewCount: 127,
    image: "/models/products/1.jpg",
    model: "/models/products/1.glb",
    material: "Premium Resin",
    scale: "1:6",
    height: "30 cm",
    base: "Weighted resin with felt bottom",
    packaging: "Protective premium display packaging",
    weight: "~0.8 kg",
    badge: "Bestseller",
    discount: "25% OFF",
    tags: ["Cyberpunk", "Character", "Gaming", "Sci-Fi"],
  },
  {
    id: "2",
    name: "Futuristic Sports Car",
    category: "Vehicles",
    description: "A premium futuristic sports car collectible with detailed geometry and a display-ready finish.",
    price: 1299,
    oldPrice: 1699,
    rating: 4.7,
    reviewCount: 892,
    image: "/models/products/2.jpg",
    model: "/models/products/2.glb",
    material: "Premium Resin",
    scale: "1:18",
    height: "9 cm",
    base: "Display base included",
    packaging: "Protective premium display packaging",
    weight: "~0.5 kg",
    badge: "Popular",
    discount: "24% OFF",
    tags: ["Car", "Vehicle", "Sci-Fi", "Gaming"],
  },
  {
    id: "3",
    name: "Anime Warrior",
    category: "Anime",
    description: "A stylized physical anime-inspired warrior collectible with detailed sculpting and a premium display finish.",
    price: 999,
    oldPrice: 1299,
    rating: 4.9,
    reviewCount: 234,
    image: "/models/products/3.jpg",
    model: "/models/products/3.glb",
    material: "Premium Resin",
    scale: "1:7",
    height: "28 cm",
    base: "Display base included",
    packaging: "Protective premium display packaging",
    weight: "~0.7 kg",
    badge: "Trending",
    discount: "23% OFF",
    tags: ["Anime", "Character", "Warrior", "Stylized"],
  },
  {
    id: "4",
    name: "Fantasy Castle",
    category: "Architecture",
    description: "A detailed physical fantasy castle miniature designed as a premium display piece.",
    price: 1799,
    oldPrice: 2299,
    rating: 4.7,
    reviewCount: 156,
    image: "/models/products/4.jpg",
    model: "/models/products/4.glb",
    material: "Premium Resin",
    scale: "1:100",
    height: "25 cm",
    base: "Integrated weighted display base",
    packaging: "Protective premium display packaging",
    weight: "~1.2 kg",
    badge: "New",
    discount: "22% OFF",
    tags: ["Castle", "Fantasy", "Architecture", "Environment"],
  },
  {
    id: "5",
    name: "Modern Interior",
    category: "Interior",
    description: "A physical miniature interior scene with detailed furniture and a refined display-ready finish.",
    price: 1199,
    rating: 4.5,
    reviewCount: 98,
    image: "/models/products/1.jpg",
    model: "/models/products/1.glb",
    material: "Premium Resin",
    scale: "1:24",
    height: "20 cm",
    base: "Integrated display base",
    packaging: "Protective premium display packaging",
    weight: "~0.9 kg",
    tags: ["Interior", "Architecture", "Furniture", "Modern"],
  },
  {
    id: "6",
    name: "Sci-Fi Robot",
    category: "Gaming",
    description: "A detailed physical sci-fi robot collectible optimized as a premium display piece.",
    price: 1399,
    oldPrice: 1799,
    rating: 4.9,
    reviewCount: 312,
    image: "/models/products/2.webp",
    model: "/models/products/2.glb",
    material: "Premium Resin",
    scale: "1:8",
    height: "24 cm",
    base: "Weighted display base",
    packaging: "Protective premium display packaging",
    weight: "~0.75 kg",
    badge: "Featured",
    discount: "22% OFF",
    tags: ["Robot", "Sci-Fi", "Gaming", "Character"],
  },
];

export function getProductById(id: string): Product | undefined {
  return products.find((product) => product.id === id);
}

export function getProductsByCategory(category: string): Product[] {
  return products.filter(
    (product) => product.category.toLowerCase() === category.toLowerCase(),
  );
}

export function getRelatedProducts(product: Product, limit = 4): Product[] {
  const sameCategory = products.filter(
    (item) => item.id !== product.id && item.category === product.category,
  );

  const otherProducts = products.filter(
    (item) => item.id !== product.id && item.category !== product.category,
  );

  return [...sameCategory, ...otherProducts].slice(0, limit);
}
