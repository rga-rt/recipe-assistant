export default defineI18nConfig(() => ({
  legacy: false,
  locale: 'en',
  messages: {
    en: {
      nav: {
        home: 'Home',
        recipes: 'Recipes',
        about: 'About',
      },
      hero: {
        title: 'Recipe Assistant',
        subtitle: 'Cook something great, in English or Spanish',
      },
      recipes: {
        title: 'Featured recipes',
        noRecipesYet: 'No recipes yet',
        minutes: 'min',
        viewRecipe: 'View recipe',
      },
      common: {
        loading: 'Loading...',
        error: 'Something went wrong',
      },
    },
    es: {
      nav: {
        home: 'Inicio',
        recipes: 'Recetas',
        about: 'Acerca de',
      },
      hero: {
        title: 'Asistente de Recetas',
        subtitle: 'Cocina algo delicioso, en inglés o español',
      },
      recipes: {
        title: 'Recetas destacadas',
        noRecipesYet: 'Sin recetas aún',
        minutes: 'min',
        viewRecipe: 'Ver receta',
      },
      common: {
        loading: 'Cargando...',
        error: 'Algo salió mal',
      },
    },
  },
}));
