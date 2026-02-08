import type { Book, ComparisonResult } from "../models/comparison.model.js";
import type { KindleClipping } from "../models/kindle-clipping.model.js";

// Helper to generate key
const getBookKey = (title: string, author: string) => `${title.toLowerCase()}|${author.toLowerCase()}`;

export function compareBooks(notionBooks: Book[], kindleBooks: Book[]): ComparisonResult {
  const result: ComparisonResult = {
    newBooks: [],
    updatedBooks: [],
  };
  
  const getBookKey = (book: Book) => `${book.title.toLowerCase()}|${book.author.toLowerCase()}`;

  const notionBookMap = new Map<string, Book>();
  for (const book of notionBooks) {
    notionBookMap.set(getBookKey(book), book);
  }

  for(const kindleBook of kindleBooks) {
    const key = getBookKey(kindleBook);
    const notionBook:Book | undefined= notionBookMap.get(key);
    if(!notionBook) {
      result.newBooks.push(kindleBook);
      continue;
    }

    const existingClippings = new Set(notionBook.clippings);
    const newClippings = kindleBook.clippings.filter(clip => !existingClippings.has(clip));
    if(newClippings.length > 0) {
      const bookToPush: Book = {
        title: kindleBook.title,
        author: kindleBook.author,
        clippings: newClippings,
      };
    
      if (notionBook.id !== undefined) {
        bookToPush.id = notionBook.id;
      }
      result.updatedBooks.push(bookToPush);
    }
  }

  return result;
}

export function filterUniqueClippings(localClippings: KindleClipping[], notionBooks: Book[]): KindleClipping[] {
  const notionMap = new Map<string, Set<string>>();

  // Build a map: "Title|Author" -> Set<Content>
  for (const book of notionBooks) {
    const key = getBookKey(book.title, book.author);
    const contentSet = new Set(book.clippings);
    notionMap.set(key, contentSet);
  }

  // Filter local clippings
  return localClippings.filter(clipping => {
    const key = getBookKey(clipping.bookName, clipping.author);
    const remoteContent = notionMap.get(key);

    // If book doesn't exist remotely, it's new (keep it)
    if (!remoteContent) return true;

    // If book exists, check if content exists
    return !remoteContent.has(clipping.content);
  });
}