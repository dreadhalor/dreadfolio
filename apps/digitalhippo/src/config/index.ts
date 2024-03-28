export const PRODUCT_CATEGORIES = [
  {
    id: 'ui-kits',
    label: 'UI Kits',
    featured: [
      {
        name: 'Editor picks',
        href: '#',
        imageSrc: '/nav/ui-kits/mixed.jpg',
      },
      {
        name: 'New Arrivals',
        href: '#',
        imageSrc: '/nav/ui-kits/blue.jpg',
      },
      {
        name: 'Bestsellers',
        href: '#',
        imageSrc: '/nav/ui-kits/purple.jpg',
      },
    ],
  },
  {
    id: 'icons',
    label: 'Icons',
    featured: [
      {
        name: 'Favorite Icon Picks',
        href: '#',
        imageSrc: '/nav/icons/picks.jpg',
      },
      {
        name: 'New Arrivals',
        href: '#',
        imageSrc: '/nav/icons/new.jpg',
      },
      {
        name: 'Bestselling Icons',
        href: '#',
        imageSrc: '/nav/icons/bestsellers.jpg',
      },
    ],
  },
] as const;
export type Category = (typeof PRODUCT_CATEGORIES)[number];

export const TRANSACTION_FEE = 1;
