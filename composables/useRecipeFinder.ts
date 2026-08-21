import type { RecipeSummary } from '~/types/recipe';

export function useRecipeFinder() {
  const step = useState<'start' | 'select' | 'results'>('finder-step', () => 'start');
  const selected = useState<string[]>('finder-selected', () => []);
  const results = useState<RecipeSummary[]>('finder-results', () => []);
  const pending = useState<boolean>('finder-pending', () => false);
  const error = useState<'quota' | 'generic' | null>('finder-error', () => null);

  const isSelected = (token: string) => selected.value.includes(token);
  function toggle(token: string) {
    selected.value = isSelected(token)
      ? selected.value.filter((t) => t !== token)
      : [...selected.value, token];
  }
  const clear = () => { selected.value = []; };
  const goStart = () => { step.value = 'start'; };
  const goSelect = () => { step.value = 'select'; };

  async function fetchRecipes() {
    if (selected.value.length === 0) return;
    pending.value = true;
    error.value = null;
    try {
      results.value = await $fetch<RecipeSummary[]>('/api/recipes/by-ingredients', {
        query: { ingredients: selected.value.join(',') },
      });
      step.value = 'results';
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- normalizing an untyped $fetch error shape
    } catch (err: any) {
      error.value = err?.statusCode === 402 ? 'quota' : 'generic';
    } finally {
      pending.value = false;
    }
  }

  return { step, selected, results, pending, error, isSelected, toggle, clear, goStart, goSelect, fetchRecipes };
}
