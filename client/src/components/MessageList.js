import store from '../store/store.js';
import { getMessages } from '../api/http.js';
import { createMessageItem } from './MessageItem.js';
import { formatDate, isSameDay } from '../utils/timeFormat.js';

function createDateDivider(timestamp) {
  const div = document.createElement('div');
  div.className = 'flex items-center gap-3 my-3 px-4';
  div.innerHTML = `
    <div class="flex-1 h-px bg-gray-200"></div>
    <span class="text-xs text-gray-400 whitespace-nowrap">${formatDate(timestamp)}</span>
    <div class="flex-1 h-px bg-gray-200"></div>
  `;
  return div;
}

export class MessageList {
  constructor(container) {
    this.container = container;
    this.loading = false;
    this._sentinel = null;
    this._observer = null;
    this._unsubscribe = null;
    this._lastRenderedDate = null;
    this._firstRender = true; // always scroll to bottom on first render
  }

  mount() {
    // Sentinel for lazy loading
    this._sentinel = document.createElement('div');
    this._sentinel.className = 'h-4';
    this.container.prepend(this._sentinel);

    this._observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !this.loading) {
          this._loadMore();
        }
      },
      { root: this.container, threshold: 0.1 },
    );
    this._observer.observe(this._sentinel);

    this._unsubscribe = store.on((key) => {
      if (key === 'messages' || key === 'searchResults') this._render();
    });

    this._render();
  }

  unmount() {
    this._observer?.disconnect();
    this._unsubscribe?.();
  }

  async _loadMore() {
    const hasMore = store.get('hasMore');
    if (!hasMore) {
      this._observer.unobserve(this._sentinel);
      return;
    }

    this.loading = true;
    const oldestId = store.get('oldestLoadedId');

    try {
      const data = await getMessages(10, oldestId);
      if (data.items.length === 0) {
        store.set('hasMore', false);
        return;
      }
      // Save scroll anchor before prepend
      const anchor = this.container.querySelector('[data-id]');
      store.set('hasMore', data.hasMore);
      store.set('oldestLoadedId', data.oldestId);
      store.prependMessages(data.items);

      // Restore scroll position
      if (anchor) {
        anchor.scrollIntoView({ block: 'start' });
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('Failed to load more:', e.message);
    } finally {
      this.loading = false;
    }
  }

  _render() {
    const messages = store.get('messages');
    const searchResults = store.get('searchResults');
    const query = store.get('searchQuery');
    const displayList = searchResults !== null ? searchResults : messages;

    // Check scroll position BEFORE removing nodes (accurate height)
    const wasAtBottom = this._isAtBottom();

    // Remove existing message nodes (keep sentinel)
    const existing = this.container.querySelectorAll('[data-id], .date-divider');
    existing.forEach((el) => el.remove());

    this._lastRenderedDate = null;

    displayList.forEach((msg, i) => {
      const prevMsg = displayList[i - 1];
      const needsDivider = !prevMsg || !isSameDay(prevMsg.timestamp, msg.timestamp);
      if (needsDivider) {
        const divider = createDateDivider(msg.timestamp);
        divider.classList.add('date-divider');
        this.container.appendChild(divider);
      }

      const item = createMessageItem(msg, { showPin: searchResults === null });

      if (query && searchResults !== null) {
        this._highlightText(item, query);
      }

      this.container.appendChild(item);
    });

    const shouldScrollDown = this._firstRender || wasAtBottom || searchResults !== null;
    if (this._firstRender) this._firstRender = false;

    if (shouldScrollDown) {
      // rAF ensures scroll happens after browser has painted the new nodes
      requestAnimationFrame(() => this._scrollToBottom());
    }
  }

  _isAtBottom() {
    const { scrollTop, scrollHeight, clientHeight } = this.container;
    return scrollHeight - scrollTop - clientHeight < 80;
  }

  _scrollToBottom() {
    this.container.scrollTop = this.container.scrollHeight;
  }

  _highlightText(el, query) {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const nodes = [];
    let node = walker.nextNode();
    while (node) {
      nodes.push(node);
      node = walker.nextNode();
    }
    const re = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    nodes.forEach((textNode) => {
      if (!re.test(textNode.textContent)) return;
      re.lastIndex = 0;
      const span = document.createElement('span');
      span.innerHTML = textNode.textContent.replace(re, '<mark class="search-highlight">$1</mark>');
      textNode.parentNode.replaceChild(span, textNode);
    });
  }
}
