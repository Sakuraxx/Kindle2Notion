import type { KindleClipping } from '../models/kindle-clipping.model.js';

const titleAuthorRegex = /^(.*) \((.*)\)$/;

const dateTimeRegex = /添加于 (\d{4})年(\d{1,2})月(\d{1,2})日.*? (上午|下午)(\d{1,2}:\d{2}:\d{2})/;

export async function parseKindleClippings(rawContent: string): Promise<KindleClipping[]> {

  const clippings: KindleClipping[] = [];
  
  const clippingBlocks = rawContent.split('==========').filter(block => block.trim() !== '');

  for(const block of clippingBlocks) {
    const lines = block.trim().split('\n').map(line => line.trim()).filter(line => line.length > 0);

    if(lines.length < 3) continue;

    // Parse title and author
    const titleLine = lines[0];
    const titleAuthorMatch = titleLine?.match(titleAuthorRegex);

    if (!titleAuthorMatch || titleAuthorMatch.length < 3) {
      continue;
    }

    const bookName = titleAuthorMatch[1]?.trim() ?? "Unknown Title";
    const author = titleAuthorMatch[2]?.trim() ?? "Unknown Author";
    
    // Parse timestamp
    let timestamp = new Date(0);
    const metaLine = lines[1];
    const dateTimeMatch = metaLine?.match(dateTimeRegex);

    // ISO 8601 format: YYYY-MM-DDTHH:MM:SS
    if (dateTimeMatch) {
      const [, year, month, day, period, time] = dateTimeMatch;

      if (!year || !month || !day || !period || !time) {
        console.error("Incomplete date match found in block:", block);
        continue;
      }
      let [hoursStr = '0', minutesStr = '0', secondsStr = '0'] = time.split(':');
      let hours = parseInt(hoursStr);
      let minutes = parseInt(minutesStr);
      let seconds = parseInt(secondsStr);

      if (period === '下午' && hours !== 12) {
        hours += 12;
      }
      if (period === '上午' && hours === 12) {
          hours = 0;
      }

      timestamp = new Date(
        parseInt(year), 
        parseInt(month) - 1,
        parseInt(day), 
        hours, 
        minutes, 
        seconds
      );
    }

    const content = lines.slice(2).join('\n').trim();

    clippings.push({
      bookName,
      author,
      timestamp,
      content
    });
  }

  return clippings;
}