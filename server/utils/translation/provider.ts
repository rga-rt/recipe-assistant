import { createHash } from 'node:crypto';

export interface TranslationProvider {
  // translated text per input, or null when it could not translate (caller uses the original and must NOT cache it)
  translate(texts: string[], target: 'es'): Promise<(string | null)[]>;
}

export function sha1(input: string): string {
  return createHash('sha1').update(input).digest('hex');
}
