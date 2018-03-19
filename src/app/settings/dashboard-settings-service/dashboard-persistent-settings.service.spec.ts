import { TestBed, inject } from '@angular/core/testing';

import { DashboardPersistentSettingsService } from './dashboard-persistent-settings.service';

describe('DashboardPersistentSettingsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DashboardPersistentSettingsService]
    });
  });

  it('should be created', inject([DashboardPersistentSettingsService], (service: DashboardPersistentSettingsService) => {
    expect(service).toBeTruthy();
  }));
});
