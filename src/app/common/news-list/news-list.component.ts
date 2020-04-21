import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  ViewEncapsulation,
} from "@angular/core";
import { NewsApiService } from "../../api/newsapi.service";
import { News, Article } from 'src/app/api/Models/news.model';
import * as moment from "moment";

@Component({
  selector: "app-news-list",
  templateUrl: "./news-list.component.html",
  styleUrls: ["./news-list.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class NewsListComponent implements OnInit {
  newsArticles: Article[] = [];
  isLoadingNews: boolean = false;

  constructor(private news: NewsApiService, private ref: ChangeDetectorRef) {
    this.fetchNews();
  }

  fetchNews() {
    this.isLoadingNews = true;
    this.news.getHealthNews<News>().subscribe(
      (data) => {
        this.newsArticles = data.articles.map((article) => ({
          ...article,
          urlToImage: `url("${article.urlToImage}")`,
          publishedAt: moment(article.publishedAt).fromNow(),
        }));
        this.isLoadingNews = false;
        this.ref.detectChanges();
      },
      (err) => {
        this.isLoadingNews = false;
        this.ref.detectChanges();
      }
    );
  }

  ngOnInit(): void { }
}
