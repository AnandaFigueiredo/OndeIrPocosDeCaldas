import { useEffect } from 'react';
export function usePageMeta(title, description, noindex = false) {
  useEffect(() => {
    document.title = title;
    for (const [selector, attr, value] of [['meta[name="description"]', 'content', description], ['meta[property="og:title"]', 'content', title], ['meta[property="og:description"]', 'content', description]]) document.querySelector(selector)?.setAttribute(attr, value);
    if (noindex) { const meta = document.createElement('meta'); meta.name = 'robots'; meta.content = 'noindex, nofollow'; document.head.append(meta); return () => meta.remove(); }
  }, [title, description, noindex]);
}
