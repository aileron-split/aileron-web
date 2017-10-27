import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WeathertankLauncherComponent } from './weathertank-launcher.component';

describe('WeathertankLauncherComponent', () => {
  let component: WeathertankLauncherComponent;
  let fixture: ComponentFixture<WeathertankLauncherComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WeathertankLauncherComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WeathertankLauncherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
