import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DevblogComponent } from './devblog.component';

describe('DevblogComponent', () => {
  let component: DevblogComponent;
  let fixture: ComponentFixture<DevblogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DevblogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DevblogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
