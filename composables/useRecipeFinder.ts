import { computed } from 'vue';
import type { RecipeSearchPage, RecipeSummary } from '~/types/recipe';
import { PAGE_SIZE, rankPages } from '~/utils/recipePaging';
import { matchCatalog } from '~/utils/catalogMatch';

// Spoonacular's complexSearch offset tops out at 900 (+100 per batch).
const MAX_RECIPES = 1000;

export function useRecipeFinder() {
  const step = useState<'start' | 'select' | 'results'>('finder-step', () => 'start');
  const selected = useState<string[]>('finder-selected', () => []);
  const cuisine = useState<string | null>('finder-cuisine', () => null);
  // token → what the user typed, for ingredients added outside the catalog
  const customLabels = useState<Record<string, string>>('finder-custom-labels', () => ({}));
  const results = useState<RecipeSummary[]>('finder-results', () => []);
  const total = useState<number>('finder-total', () => 0);
  const batch = useState<number>('finder-batch', () => 0);
  const visibleCount = useState<number>('finder-visible', () => PAGE_SIZE);
  const pending = useState<boolean>('finder-pending', () => false);
  const loadingMore = useState<boolean>('finder-loading-more', () => false);
  const error = useState<'quota' | 'generic' | null>('finder-error', () => null);
  // Errors from "Show more" are kept apart so a failed page doesn't hide loaded results.
  const loadMoreError = useState<'quota' | 'generic' | null>('finder-load-more-error', () => null);
  // Bumped on every new search; a "Show more" response from an older search is dropped.
  const generation = useState<number>('finder-generation', () => 0);

  const available = computed(() => Math.min(total.value, MAX_RECIPES));
  const visible = computed(() => rankPages(results.value).slice(0, visibleCount.value));
  const hasMore = computed(
    () => visibleCount.value < results.value.length || results.value.length < available.value,
  );

  const isSelected = (token: string) => selected.value.includes(token);
  function dropLabel(token: string) {
    if (!(token in customLabels.value)) return;
    const { [token]: _removed, ...rest } = customLabels.value;
    void _removed;
    customLabels.value = rest;
  }
  function toggle(token: string) {
    if (isSelected(token)) {
      selected.value = selected.value.filter((t) => t !== token);
      dropLabel(token);
    } else {
      selected.value = [...selected.value, token];
    }
  }
  const clear = () => {
    selected.value = [];
    customLabels.value = {};
  };

  type AddResult = 'added' | 'duplicate' | 'not_found' | 'quota' | 'error';
  async function addCustom(text: string, locale: 'en' | 'es'): Promise<AddResult> {
    const typed = text.trim();
    if (!typed) return 'error';
    let token: string;
    try {
      ({ token } = await $fetch<{ token: string }>('/api/ingredients/resolve', {
        query: { q: typed, locale },
      }));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- normalizing an untyped $fetch error shape
    } catch (err: any) {
      if (err?.statusCode === 404) return 'not_found';
      if (err?.statusCode === 402) return 'quota';
      return 'error';
    }
    if (isSelected(token)) return 'duplicate';
    selected.value = [...selected.value, token];
    if (!matchCatalog(token)) customLabels.value = { ...customLabels.value, [token]: typed };
    return 'added';
  }
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
    const gen = ++generation.value;
    pending.value = true;
    error.value = null;
    loadMoreError.value = null;
    loadingMore.value = false;
    try {
      const page = await fetchPage(0);
      if (gen !== generation.value) return;
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
      const gen = generation.value;
      loadingMore.value = true;
      loadMoreError.value = null;
      try {
        const page = await fetchPage(batch.value + 1);
        if (gen !== generation.value) return;
        const seen = new Set(results.value.map((r) => r.id));
        const fresh = page.recipes.filter((r) => !seen.has(r.id));
        results.value = [...results.value, ...fresh];
        batch.value += 1;
        // Spoonacular's totalResults can overstate what it returns; stop paging
        // instead of spending quota on batches that add nothing.
        if (fresh.length === 0) total.value = results.value.length;
      } catch (err) {
        if (gen === generation.value) loadMoreError.value = toError(err);
        return;
      } finally {
        if (gen === generation.value) loadingMore.value = false;
      }
    }
    visibleCount.value += PAGE_SIZE;
  }

  async function searchAllCuisines() {
    cuisine.value = null;
    await fetchRecipes();
  }

  return {
    step, selected, cuisine, customLabels, results, total, visibleCount, visible, hasMore, pending, loadingMore, error, loadMoreError,
    isSelected, toggle, clear, addCustom, goStart, goSelect, fetchRecipes, showMore, searchAllCuisines,
  };
}
