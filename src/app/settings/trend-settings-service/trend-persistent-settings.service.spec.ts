import { TestBed, inject } from '@angular/core/testing';

import { TrendPersistentSettingsService } from './trend-persistent-settings.service';

describe('TrendPersistentSettingsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TrendPersistentSettingsService]
    });
  });

  it('should be created', inject([TrendPersistentSettingsService], (service: TrendPersistentSettingsService) => {
    expect(service).toBeTruthy();
  }));
});
