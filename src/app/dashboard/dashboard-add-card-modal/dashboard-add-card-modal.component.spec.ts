import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardCardModalComponent } from './dashboard-card-modal.component';

describe('DashboardCardModalComponent', () => {
  let component: DashboardCardModalComponent;
  let fixture: ComponentFixture<DashboardCardModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DashboardCardModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardCardModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
