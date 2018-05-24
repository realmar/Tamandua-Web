import { TestBed, inject } from '@angular/core/testing';

import { SettingsUtilsService } from './settings-utils.service';

describe('SettingsUtilsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SettingsUtilsService]
    });
  });

  it('should be created', inject([SettingsUtilsService], (service: SettingsUtilsService) => {
    expect(service).toBeTruthy();
  }));
});
