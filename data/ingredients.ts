import type { IngredientCategory } from '~/types/recipe';

export const INGREDIENT_CATEGORIES: IngredientCategory[] = [
  {
    id: 'vegetables',
    ingredients: [
      { token: 'tomato', en: 'Tomato', es: 'Tomate' },
      { token: 'onion', en: 'Onion', es: 'Cebolla' },
      { token: 'garlic', en: 'Garlic', es: 'Ajo' },
      { token: 'carrot', en: 'Carrot', es: 'Zanahoria' },
      { token: 'potato', en: 'Potato', es: 'Papa' },
      { token: 'bell pepper', en: 'Bell pepper', es: 'Pimiento' },
      { token: 'spinach', en: 'Spinach', es: 'Espinaca' },
      { token: 'mushroom', en: 'Mushroom', es: 'Champiñón' },
    ],
  },
  {
    id: 'fruits',
    ingredients: [
      { token: 'lemon', en: 'Lemon', es: 'Limón' },
      { token: 'apple', en: 'Apple', es: 'Manzana' },
      { token: 'banana', en: 'Banana', es: 'Plátano' },
      { token: 'avocado', en: 'Avocado', es: 'Aguacate' },
      { token: 'lime', en: 'Lime', es: 'Lima' },
    ],
  },
  {
    id: 'proteins',
    ingredients: [
      { token: 'chicken breast', en: 'Chicken breast', es: 'Pechuga de pollo' },
      { token: 'ground beef', en: 'Ground beef', es: 'Carne molida' },
      { token: 'pork', en: 'Pork', es: 'Cerdo' },
      { token: 'salmon', en: 'Salmon', es: 'Salmón' },
      { token: 'shrimp', en: 'Shrimp', es: 'Camarón' },
      { token: 'tofu', en: 'Tofu', es: 'Tofu' },
    ],
  },
  {
    id: 'dairy-eggs',
    ingredients: [
      { token: 'egg', en: 'Egg', es: 'Huevo' },
      { token: 'milk', en: 'Milk', es: 'Leche' },
      { token: 'butter', en: 'Butter', es: 'Mantequilla' },
      { token: 'cheese', en: 'Cheese', es: 'Queso' },
      { token: 'yogurt', en: 'Yogurt', es: 'Yogur' },
    ],
  },
  {
    id: 'grains-pasta',
    ingredients: [
      { token: 'rice', en: 'Rice', es: 'Arroz' },
      { token: 'pasta', en: 'Pasta', es: 'Pasta' },
      { token: 'flour', en: 'Flour', es: 'Harina' },
      { token: 'bread', en: 'Bread', es: 'Pan' },
      { token: 'oats', en: 'Oats', es: 'Avena' },
    ],
  },
  {
    id: 'legumes',
    ingredients: [
      { token: 'black beans', en: 'Black beans', es: 'Frijoles negros' },
      { token: 'chickpeas', en: 'Chickpeas', es: 'Garbanzos' },
      { token: 'lentils', en: 'Lentils', es: 'Lentejas' },
    ],
  },
  {
    id: 'herbs-spices',
    ingredients: [
      { token: 'basil', en: 'Basil', es: 'Albahaca' },
      { token: 'cilantro', en: 'Cilantro', es: 'Cilantro' },
      { token: 'cumin', en: 'Cumin', es: 'Comino' },
      { token: 'paprika', en: 'Paprika', es: 'Pimentón' },
      { token: 'oregano', en: 'Oregano', es: 'Orégano' },
    ],
  },
  {
    id: 'pantry-oils',
    ingredients: [
      { token: 'olive oil', en: 'Olive oil', es: 'Aceite de oliva' },
      { token: 'sugar', en: 'Sugar', es: 'Azúcar' },
      { token: 'salt', en: 'Salt', es: 'Sal' },
      { token: 'soy sauce', en: 'Soy sauce', es: 'Salsa de soja' },
      { token: 'tomato sauce', en: 'Tomato sauce', es: 'Salsa de tomate' },
    ],
  },
];

export function allTokens(): string[] {
  return INGREDIENT_CATEGORIES.flatMap((c) => c.ingredients.map((i) => i.token));
}
