import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';

const OUTPUT_FILENAME = 'My Clippings.txt';
const NUMBER_OF_CLIPPINGS = 101;

const books = [
  // { title: 'Atomic Habits', author: 'James Clear' },
  // { title: 'The Pragmatic Programmer', author: 'David Thomas, Andrew Hunt' },
  // { title: 'Clean Code', author: 'Robert C. Martin' },
  { title: 'A Mind For Numbers', author: 'Barbara Oakley' },
];

const quotes = [
  "This is a sample quote about programming.",
  "Creativity is intelligence having fun.",
  "The only way to do great work is to love what you do.",
  "Simplicity is the ultimate sophistication.",
  "Stay hungry, stay foolish.",
  "It does not matter how slowly you go as long as you do not stop.",
];

function getRandomElement<T>(arr: T[]): T {
  if (arr.length === 0) {
      throw new Error("Attempted to get a random element from an empty array.");
  }
  const randomIndex = Math.floor(Math.random() * arr.length);
  return arr[randomIndex] as T;
}

function getRandomDate(): Date {
  const now = new Date();
  const past = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
  const randomTimestamp = past.getTime() + Math.random() * (now.getTime() - past.getTime());
  return new Date(randomTimestamp);
}

function formatKindleDate(date: Date): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  const weekday = weekdays[date.getDay()];
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  
  const period = hours >= 12 ? '下午' : '上午';
  hours = hours % 12;
  if (hours === 0) {
      hours = 12;
  }
  
  return `${year}年${month}月${day}日${weekday} ${period}${hours}:${minutes}:${seconds}`;
}

function createClippingBlock(index: number): string {
  const book = getRandomElement(books);
  const date = getRandomDate();
  
  const page = 100 + index;
  const locationStart = 1500 + (index * 5);
  const locationEnd = locationStart + Math.floor(Math.random() * 3);
  const formattedDate = formatKindleDate(date);
  const content = `${getRandomElement(quotes)} (No. ${index + 1})`;
  
  return `
  ${book.title} (${book.author})
  - 您在第 ${page} 页（位置 #${locationStart}-${locationEnd}）的标注 | 添加于 ${formattedDate}
  ${content}
  `.trim();
}

async function generateClippingsFile() {
  console.log(`Generating ${NUMBER_OF_CLIPPINGS} clippings...`);
  
  const allClippingBlocks: string[] = [];
  for (let i = 0; i < NUMBER_OF_CLIPPINGS; i++) {
      allClippingBlocks.push(createClippingBlock(i));
  }
  const fileContent = allClippingBlocks.join('\n==========\n');
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const outputPath = path.join(__dirname, OUTPUT_FILENAME);
  
  try {
      await fs.writeFile(outputPath, fileContent, 'utf-8');
      console.log(`Successfully generated fake data to: ${outputPath}`);
  } catch (error) {
      console.error(`Failed to write file: ${error}`);
  }
}

generateClippingsFile();