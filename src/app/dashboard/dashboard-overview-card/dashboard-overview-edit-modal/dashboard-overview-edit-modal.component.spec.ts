import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardOverviewEditModalComponent } from './dashboard-overview-edit-modal.component';

describe('DashboardOverviewEditModalComponent', () => {
  let component: DashboardOverviewEditModalComponent;
  let fixture: ComponentFixture<DashboardOverviewEditModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DashboardOverviewEditModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardOverviewEditModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
