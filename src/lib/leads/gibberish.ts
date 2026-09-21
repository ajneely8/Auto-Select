/**
 * Heuristic for bot-typed names ("Kkfn Rhccj", "Gbsvnwqr"). Kept free of server-only imports so it
 * can be unit-tested. It only ever reads names, and its result is used to file a submission under
 * Spam (still visible in the CRM), never to discard it — so an unusual real name costs a status
 * change, not a lost lead.
 */

const VOWELS = /[aeiouy]/i;

/** 2 = strong signal (enough alone), 1 = weak signal (needs another), 0 = looks like a name. */
function scoreName(raw: string): number {
  const word = raw.toLowerCase().replace(/[^a-z]/g, "");
  if (word.length < 3) return 0;
  const consonantRun = Math.max(0, ...(word.match(/[^aeiouy]+/g) ?? []).map((r) => r.length));
  if (!VOWELS.test(word) && word.length >= 4) return 2;
  if (consonantRun >= 5) return 2;
  let weak = 0;
  if (/q(?!u)/.test(word)) weak++;
  if (consonantRun === 4) weak++;
  return weak >= 2 ? 2 : weak;
}

export function looksLikeGibberishName(fields: Record<string, string | undefined>): boolean {
  const names = [fields.firstName, fields.lastName, fields.name].filter((n): n is string => !!n && n.trim() !== "" && n.trim() !== "-");
  const total = names.reduce((sum, n) => sum + scoreName(n), 0);
  return total >= 2;
}
