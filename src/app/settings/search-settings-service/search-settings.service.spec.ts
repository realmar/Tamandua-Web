import { TestBed, inject } from '@angular/core/testing';

import { SearchSettingsService } from './search-settings.service';

describe('SearchSettingsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SearchSettingsService]
    });
  });

  it('should be created', inject([SearchSettingsService], (service: SearchSettingsService) => {
    expect(service).toBeTruthy();
  }));
});
