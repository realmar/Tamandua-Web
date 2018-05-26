import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LeftToRightPulseComponent } from './left-to-right-pulse.component';

describe('LeftToRightPulseComponent', () => {
  let component: LeftToRightPulseComponent;
  let fixture: ComponentFixture<LeftToRightPulseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LeftToRightPulseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LeftToRightPulseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
