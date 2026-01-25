export interface Book {
  id?: string;
  title: string;
  author: string;
  clippings: string[]
}

export interface ComparisonResult {
  newBooks: Book[];
  updatedBooks: Book[]; // Only return books that have new clippings
}