// src/config/hero-products.ts

export interface HeroProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  model: string;
  category: string;
  metrics: {
    label: string;
    value: string;
  }[];
}

export const heroProducts: HeroProduct[] = [
  {
    id: "product-1",
    name: "Cyber Warrior",
    description:
      "A premium futuristic warrior collectible with clean sculpting, dramatic armor detail, and a presentation-ready finish for display.",
    price: 2499,
    model: "/models/products/1.glb",
    category: "Gaming",
    metrics: [
      { label: "Material", value: "Premium resin" },
      { label: "Finish", value: "Display ready" },
      { label: "Delivery", value: "Shipped to you" },
    ],
  },
  {
    id: "product-2",
    name: "Mecha Guardian",
    description:
      "A heavy mechanical guardian collectible designed for premium display, with bold geometry and refined surface detail.",
    price: 3299,
    model: "/models/products/2.glb",
    category: "Prime",
    metrics: [
      { label: "Quality", value: "High detail" },
      { label: "Finish", value: "Premium display" },
      { label: "Delivery", value: "Shipped to you" },
    ],
  },
  {
    id: "product-3",
    name: "Future Racer",
    description:
      "A sleek concept-speed collectible created for premium display, with a refined silhouette and presentation-ready finish.",
    price: 1999,
    model: "/models/products/3.glb",
    category: "Mobility",
    metrics: [
      { label: "Material", value: "Premium resin" },
      { label: "Finish", value: "Display ready" },
      { label: "Delivery", value: "Shipped to you" },
    ],
  },
  {
    id: "product-4",
    name: "Nova Sentinel",
    description:
      "A precision-crafted futuristic collectible with bold geometry, refined surface details, and a premium display finish.",
    price: 2899,
    model: "/models/products/4.glb",
    category: "Collectibles",
    metrics: [
      { label: "Quality", value: "Premium detail" },
      { label: "Finish", value: "Display ready" },
      { label: "Delivery", value: "Shipped to you" },
    ],
  },
];
