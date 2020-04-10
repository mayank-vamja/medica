export interface ArticleSource {
  id: any;
  name: string;
}

export interface Article {
  source: ArticleSource;
  author: string;
  title: string;
  description: string;
  url: string;
  urlToImage: string;
  publishedAt: string;
  content: string;
}

export interface News {
  status: string;
  totalResults: number;
  articles: Article[];
}