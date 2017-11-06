import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DevblogArticlePreviewComponent } from './devblog-article-preview.component';

describe('DevblogArticlePreviewComponent', () => {
  let component: DevblogArticlePreviewComponent;
  let fixture: ComponentFixture<DevblogArticlePreviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DevblogArticlePreviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DevblogArticlePreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
