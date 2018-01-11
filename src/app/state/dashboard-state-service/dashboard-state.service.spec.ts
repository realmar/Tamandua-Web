import { TestBed, inject } from '@angular/core/testing';

import { DashboardStateService } from './dashboard-state.service';

describe('DashboardStateService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DashboardStateService]
    });
  });

  it('should be created', inject([DashboardStateService], (service: DashboardStateService) => {
    expect(service).toBeTruthy();
  }));
});
