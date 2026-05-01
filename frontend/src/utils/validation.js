export function validateGitHubUrl(url) {
  if (!url || typeof url !== 'string') return { valid: false, error: 'Please enter a URL.' };
  const trimmed = url.trim();
  if (!trimmed.includes('github.com')) return { valid: false, error: 'Must be a GitHub URL (github.com).' };
  const parts = trimmed.split('github.com/').pop().split('/').filter(Boolean);
  if (parts.length < 2) return { valid: false, error: 'URL must include owner and repository name.' };
  return { valid: true, error: null };
}
