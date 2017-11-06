import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DevblogArticleComponent } from './devblog-article.component';

describe('DevblogArticleComponent', () => {
  let component: DevblogArticleComponent;
  let fixture: ComponentFixture<DevblogArticleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DevblogArticleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DevblogArticleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
