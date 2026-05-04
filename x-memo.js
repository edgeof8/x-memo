(function () {
  (async () => {
    const h = location.hostname;

    function showToast(msg, err) {
      const el = document.createElement('div');
      el.textContent = msg;
      el.style.cssText =
        'position:fixed;top:20px;right:20px;padding:12px 20px;border-radius:8px;' +
        'font:600 14px -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;' +
        'color:#fff;z-index:9999999;box-shadow:0 4px 20px rgba(0,0,0,.4);' +
        'transition:opacity .3s;background:' + (err ? '#e0245e' : '#1d9bf0');
      document.body.appendChild(el);
      setTimeout(() => {
        el.style.opacity = 0;
        setTimeout(() => el.remove(), 300);
      }, 2500);
    }

    if (!h.includes('x.com') && !h.includes('twitter.com')) return;
    if (!location.pathname.includes('/status/')) {
      showToast('x-memo: Navigate to a tweet or thread first', true);
      return;
    }

    // True if el is inside container with no intermediate <article> element
    function directIn(el, container) {
      let p = el.parentElement;
      while (p && p !== container) {
        if (p.tagName === 'ARTICLE') return false;
        p = p.parentElement;
      }
      return p === container;
    }

    // querySelector but only matches elements directly inside container
    function findDirect(container, sel) {
      for (const el of container.querySelectorAll(sel)) {
        if (directIn(el, container)) return el;
      }
      return null;
    }

    // Convert tweet DOM subtree to Markdown text
    function nodeToMd(el) {
      let t = '';
      el.childNodes.forEach(n => {
        if (n.nodeType === 3) { t += n.textContent; return; }
        if (n.nodeType !== 1) return;
        const tag = n.tagName;
        if (tag === 'BR') { t += '\n'; return; }
        if (tag === 'IMG') { t += n.alt || ''; return; } // inline emoji
        if (tag === 'A') {
          const inner = nodeToMd(n).trim();
          const href = n.href || '';
          // Keep hashtags and @mentions as plain text
          if (inner.startsWith('#') || inner.startsWith('@')) { t += inner; return; }
          // Strip t.co / internal X links — show display text only
          if (!href || href.includes('t.co') || href.includes('/i/')) { t += inner; return; }
          t += `[${inner}](${href})`;
          return;
        }
        t += nodeToMd(n);
      });
      return t;
    }

    const seen = new Set();

    function parseTweet(article, isQuote) {
      // --- Author ---
      const nameEl = findDirect(article, '[data-testid="User-Name"]');
      let displayName = '', username = '';
      if (nameEl) {
        const raw = (nameEl.innerText || nameEl.textContent || '').trim();
        const parts = raw.split(/[\n\r·•]+/).map(s => s.trim()).filter(Boolean);
        displayName = parts.find(p => !p.startsWith('@') && p !== '·') || '';
        username    = parts.find(p => p.startsWith('@')) || '';
        if (!username) {
          const a = nameEl.querySelector('a[href]');
          if (a) {
            const m = a.getAttribute('href').match(/^\/([^/?#]+)/);
            if (m) username = '@' + m[1];
          }
        }
      }

      // --- Timestamp ---
      const timeEl  = findDirect(article, 'time');
      const dispTime = timeEl ? timeEl.textContent.trim() : '';

      // --- Tweet body ---
      const textEl = findDirect(article, '[data-testid="tweetText"]');
      const text   = textEl ? nodeToMd(textEl).trim().replace(/\n{3,}/g, '\n\n') : '';

      // --- Deduplication ---
      const key = (username + '|' + text).slice(0, 140);
      if (seen.has(key)) return null;
      seen.add(key);

      // --- Images ---
      const imgs = [];
      for (const photo of article.querySelectorAll('[data-testid="tweetPhoto"]')) {
        if (!directIn(photo, article)) continue;
        const img = photo.querySelector('img');
        if (img?.src && !img.src.includes('profile_images') && !img.src.includes('emoji')) {
          imgs.push('![](' + img.src.split('?')[0] + ')');
        }
      }

      // --- Video ---
      const hasVideo = !!(
        findDirect(article, '[data-testid="videoComponent"]') ||
        findDirect(article, '[data-testid="videoPlayer"]')
      );

      // --- Quoted tweet ---
      let quotedMd = '';
      if (!isQuote) {
        // Quoted tweets appear as a nested <article> inside the outer article
        const nested = article.querySelector('article[data-testid="tweet"]');
        if (nested) {
          const qt = parseTweet(nested, true);
          if (qt) quotedMd = fmtQuote(qt);
        } else {
          // Fallback: div[role="link"] with embedded tweet content (older X layout)
          for (const link of article.querySelectorAll('div[role="link"]')) {
            const qTextEl = link.querySelector('[data-testid="tweetText"]');
            if (!qTextEl) continue;
            const qNameEl = link.querySelector('[data-testid="User-Name"]');
            let qDisplay = '', qUser = '';
            if (qNameEl) {
              const r  = (qNameEl.innerText || qNameEl.textContent || '').trim();
              const ps = r.split(/[\n\r·•]+/).map(s => s.trim()).filter(Boolean);
              qDisplay = ps.find(p => !p.startsWith('@')) || '';
              qUser    = ps.find(p => p.startsWith('@'))  || '';
            }
            const qTimeEl = link.querySelector('time');
            quotedMd = fmtQuote({
              displayName: qDisplay,
              username:    qUser,
              dispTime:    qTimeEl ? qTimeEl.textContent.trim() : '',
              text:        nodeToMd(qTextEl).trim(),
              imgs:        [],
              hasVideo:    false
            });
            break;
          }
        }
      }

      return { displayName, username, dispTime, text, imgs, hasVideo, quotedMd };
    }

    function fmtQuote(t) {
      const hdr   = [t.displayName, t.username].filter(Boolean).join(' ') +
                    (t.dispTime ? ' · ' + t.dispTime : '');
      const lines = ['> **' + hdr + '**'];
      if (t.text) t.text.split('\n').forEach(l => lines.push('> ' + l));
      t.imgs.forEach(i => lines.push('> ' + i));
      if (t.hasVideo) lines.push('> `[video]`');
      return lines.join('\n');
    }

    function fmtTweet(t) {
      const hdr = (t.displayName ? '**' + t.displayName + '**' : '') +
                  (t.username  ? ' ' + t.username  : '') +
                  (t.dispTime  ? ' · ' + t.dispTime : '');
      const parts = [];
      if (hdr.trim()) parts.push(hdr.trim());
      if (t.text)     parts.push(t.text);
      t.imgs.forEach(i => parts.push(i));
      if (t.hasVideo)  parts.push('`[video]`');
      if (t.quotedMd)  parts.push(t.quotedMd);
      return parts.join('\n\n');
    }

    // --- Collect top-level tweet articles ---
    const tweets = [];
    for (const article of document.querySelectorAll('article[data-testid="tweet"]')) {
      // Skip articles nested inside another article (they are quoted tweets)
      if (article.parentElement?.closest('article[data-testid="tweet"]')) continue;
      const t = parseTweet(article, false);
      if (t) tweets.push(t);
    }

    if (!tweets.length) {
      showToast('x-memo: No tweets found on page', true);
      return;
    }

    // --- Assemble Markdown ---
    const date      = new Date().toISOString().split('T')[0];
    const first     = tweets[0];
    const urlAuthor = location.pathname.match(/^\/([^/?#]+)\/status/)?.[1] || '';
    const author    = first.username || '@' + urlAuthor;
    const title     = 'Thread by ' + (first.displayName || author);

    const frontmatter = [
      '---',
      'title: "' + title.replace(/"/g, '\\"') + '"',
      'author: "' + author + '"',
      'source: ' + location.href,
      'clipped: ' + date,
      'thread_length: ' + tweets.length,
      '---'
    ].join('\n');

    const body = tweets.map(fmtTweet).join('\n\n---\n\n');
    const md   = frontmatter + '\n\n# ' + title + '\n\n' + body;

    // --- Copy to clipboard (with execCommand fallback) ---
    const origTitle = document.title;
    try {
      await navigator.clipboard.writeText(md);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = md;
      ta.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }

    showToast('✓ Copied ' + tweets.length + '-tweet thread by ' + author);
    document.title = '✓ Copied';
    setTimeout(() => { document.title = origTitle; }, 1500);
  })();
})();
