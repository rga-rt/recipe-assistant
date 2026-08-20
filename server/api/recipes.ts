import type { Recipe } from '~/types/recipe';

// In-memory sample data. Swap this for a database layer later
// (the scaffold supports SQLite + Drizzle or Supabase as add-ons).
const recipes: Recipe[] = [
  {
    id: 1,
    title: 'Classic Margherita Pizza',
    description: 'Blistered crust, San Marzano tomato, fresh mozzarella, basil.',
    minutes: 45,
    tags: ['italian', 'vegetarian'],
  },
  {
    id: 2,
    title: 'Weeknight Chicken Tacos',
    description: 'Spiced chicken thighs, quick slaw, lime crema, warm tortillas.',
    minutes: 30,
    tags: ['mexican', 'quick'],
  },
  {
    id: 3,
    title: 'Creamy Mushroom Risotto',
    description: 'Slow-stirred arborio rice, cremini, parmesan, white wine.',
    minutes: 40,
    tags: ['italian', 'vegetarian', 'comfort'],
  },
];

export default defineEventHandler((): Recipe[] => {
  return recipes;
});
