import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PaperplaneLauncherComponent } from './paperplane-launcher.component';

describe('PaperplaneLauncherComponent', () => {
  let component: PaperplaneLauncherComponent;
  let fixture: ComponentFixture<PaperplaneLauncherComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PaperplaneLauncherComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PaperplaneLauncherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
