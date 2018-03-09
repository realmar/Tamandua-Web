import { TestBed, inject } from '@angular/core/testing';

import { DashboardPersistentStateServiceService } from './dashboard-persistent-state-service.service';

describe('DashboardPersistentStateServiceService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DashboardPersistentStateServiceService]
    });
  });

  it('should be created', inject([DashboardPersistentStateServiceService], (service: DashboardPersistentStateServiceService) => {
    expect(service).toBeTruthy();
  }));
});
