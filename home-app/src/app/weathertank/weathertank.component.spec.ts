import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WeathertankComponent } from './weathertank.component';

describe('WeathertankComponent', () => {
  let component: WeathertankComponent;
  let fixture: ComponentFixture<WeathertankComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WeathertankComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WeathertankComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
