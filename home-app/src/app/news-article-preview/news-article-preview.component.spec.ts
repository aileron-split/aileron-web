import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewsArticlePreviewComponent } from './news-article-preview.component';

describe('NewsArticlePreviewComponent', () => {
  let component: NewsArticlePreviewComponent;
  let fixture: ComponentFixture<NewsArticlePreviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewsArticlePreviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewsArticlePreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
