import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardOverviewCardComponent } from './dashboard-overview-card.component';

describe('DashboardOverviewCardComponent', () => {
  let component: DashboardOverviewCardComponent;
  let fixture: ComponentFixture<DashboardOverviewCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DashboardOverviewCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardOverviewCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
