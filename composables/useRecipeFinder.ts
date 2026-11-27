import type { RecipeSearchPage, RecipeSummary } from '~/types/recipe';
import { PAGE_SIZE, rankPages } from '~/utils/recipePaging';

// Spoonacular's complexSearch offset tops out at 900 (+100 per batch).
const MAX_RECIPES = 1000;

export function useRecipeFinder() {
  const step = useState<'start' | 'select' | 'results'>('finder-step', () => 'start');
  const selected = useState<string[]>('finder-selected', () => []);
  const cuisine = useState<string | null>('finder-cuisine', () => null);
  const results = useState<RecipeSummary[]>('finder-results', () => []);
  const total = useState<number>('finder-total', () => 0);
  const batch = useState<number>('finder-batch', () => 0);
  const visibleCount = useState<number>('finder-visible', () => PAGE_SIZE);
  const pending = useState<boolean>('finder-pending', () => false);
  const loadingMore = useState<boolean>('finder-loading-more', () => false);
  const error = useState<'quota' | 'generic' | null>('finder-error', () => null);

  const available = computed(() => Math.min(total.value, MAX_RECIPES));
  const visible = computed(() => rankPages(results.value).slice(0, visibleCount.value));
  const hasMore = computed(
    () => visibleCount.value < results.value.length || results.value.length < available.value,
  );

  const isSelected = (token: string) => selected.value.includes(token);
  function toggle(token: string) {
    selected.value = isSelected(token)
      ? selected.value.filter((t) => t !== token)
      : [...selected.value, token];
  }
  const clear = () => { selected.value = []; };
  const goStart = () => { step.value = 'start'; };
  const goSelect = () => { step.value = 'select'; };

  function fetchPage(n: number) {
    return $fetch<RecipeSearchPage>('/api/recipes/by-ingredients', {
      query: {
        ingredients: selected.value.join(','),
        ...(cuisine.value ? { cuisine: cuisine.value } : {}),
        ...(n > 0 ? { batch: n } : {}),
      },
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- normalizing an untyped $fetch error shape
  const toError = (err: any) => (err?.statusCode === 402 ? 'quota' : 'generic');

  async function fetchRecipes() {
    if (selected.value.length === 0) return;
    pending.value = true;
    error.value = null;
    try {
      const page = await fetchPage(0);
      results.value = page.recipes;
      total.value = page.total;
      batch.value = 0;
      visibleCount.value = PAGE_SIZE;
      step.value = 'results';
    } catch (err) {
      error.value = toError(err);
    } finally {
      pending.value = false;
    }
  }

  async function showMore() {
    if (!hasMore.value || loadingMore.value) return;
    const needsFetch =
      visibleCount.value + PAGE_SIZE > results.value.length && results.value.length < available.value;
    if (needsFetch) {
      loadingMore.value = true;
      try {
        const page = await fetchPage(batch.value + 1);
        const seen = new Set(results.value.map((r) => r.id));
        results.value = [...results.value, ...page.recipes.filter((r) => !seen.has(r.id))];
        batch.value += 1;
      } catch (err) {
        error.value = toError(err);
        return;
      } finally {
        loadingMore.value = false;
      }
    }
    visibleCount.value += PAGE_SIZE;
  }

  return {
    step, selected, cuisine, results, total, visibleCount, visible, hasMore, pending, loadingMore, error,
    isSelected, toggle, clear, goStart, goSelect, fetchRecipes, showMore,
  };
}
