import { TestBed, inject } from '@angular/core/testing';

import { DashboardSettingsService } from './dashboard-settings.service';

describe('DashboardSettingsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DashboardSettingsService]
    });
  });

  it('should be created', inject([DashboardSettingsService], (service: DashboardSettingsService) => {
    expect(service).toBeTruthy();
  }));
});
