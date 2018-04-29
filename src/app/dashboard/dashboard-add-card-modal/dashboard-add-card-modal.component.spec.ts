import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardAddCardModalComponent } from './dashboard-add-card-modal.component';

describe('DashboardAddCardModalComponent', () => {
  let component: DashboardAddCardModalComponent;
  let fixture: ComponentFixture<DashboardAddCardModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DashboardAddCardModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardAddCardModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
