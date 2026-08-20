import { createHash } from 'node:crypto';

export interface TranslationProvider {
  translate(texts: string[], target: 'es'): Promise<string[]>;
}

export function sha1(input: string): string {
  return createHash('sha1').update(input).digest('hex');
}
