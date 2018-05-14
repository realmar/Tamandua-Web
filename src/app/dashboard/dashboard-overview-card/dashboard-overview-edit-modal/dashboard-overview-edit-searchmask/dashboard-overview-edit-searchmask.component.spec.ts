import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardOverviewEditSearchmaskComponent } from './dashboard-overview-edit-searchmask.component';

describe('DashboardOverviewEditSearchmaskComponent', () => {
  let component: DashboardOverviewEditSearchmaskComponent;
  let fixture: ComponentFixture<DashboardOverviewEditSearchmaskComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DashboardOverviewEditSearchmaskComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardOverviewEditSearchmaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
