/** Absolute path to a generated OG PNG for a blog or work entry. */
export function ogImagePath(
  kind: 'blog' | 'work',
  id: string
): string {
  return `/og/${kind}/${id}.png`;
}
