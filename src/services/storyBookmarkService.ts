type BookmarkListener = (storyId: string, isBookmarked: boolean) => void;

const bookmarkOverrides = new Map<string, boolean>();
const listeners = new Set<BookmarkListener>();

export const storyBookmarkService = {
  getBookmark(storyId: string, initialValue = false): boolean {
    return bookmarkOverrides.get(storyId) ?? initialValue;
  },

  setBookmark(storyId: string, isBookmarked: boolean): void {
    bookmarkOverrides.set(storyId, isBookmarked);
    listeners.forEach((listener) => listener(storyId, isBookmarked));
  },

  subscribe(listener: BookmarkListener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
