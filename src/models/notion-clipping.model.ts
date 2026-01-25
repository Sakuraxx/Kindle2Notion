export interface NotionBookClipping
{
  id: string, // page id
  title: string,
  author: string,
  blocks: NotionBlock[]
}

export interface NotionBlock
{
  id: string, // block id
  content: string // plain text
}