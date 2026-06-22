export function sync() {}

export function init() {
  const btn = document.getElementById('share-btn');
  if (!btn) return;
  btn.addEventListener('click', async () => {
    const url = DataX.GetAppStateUrl(ThisPageUrl, true);
    try {
      await navigator.clipboard.writeText(url);
      const t = btn.getAttribute('title');
      btn.setAttribute('title', 'Link copied!');
      setTimeout(() => btn.setAttribute('title', t), 1500);
    } catch (e) {
      prompt('Copy this link:', url);
    }
  });
}
