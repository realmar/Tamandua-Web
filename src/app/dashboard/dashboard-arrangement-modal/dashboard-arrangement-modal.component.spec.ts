import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardArrangementModalComponent } from './dashboard-arrangement-modal.component';

describe('DashboardArrangementModalComponent', () => {
  let component: DashboardArrangementModalComponent;
  let fixture: ComponentFixture<DashboardArrangementModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DashboardArrangementModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardArrangementModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
