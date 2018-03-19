import { TestBed, inject } from '@angular/core/testing';

import { SearchPersistentSettingsService } from './search-persistent-settings.service';

describe('SearchPersistentSettingsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SearchPersistentSettingsService]
    });
  });

  it('should be created', inject([SearchPersistentSettingsService], (service: SearchPersistentSettingsService) => {
    expect(service).toBeTruthy();
  }));
});
