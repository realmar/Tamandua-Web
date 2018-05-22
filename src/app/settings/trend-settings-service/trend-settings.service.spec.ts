import { TestBed, inject } from '@angular/core/testing';

import { TrendSettingsService } from './trend-settings.service';

describe('TrendSettingsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TrendSettingsService]
    });
  });

  it('should be created', inject([TrendSettingsService], (service: TrendSettingsService) => {
    expect(service).toBeTruthy();
  }));
});
