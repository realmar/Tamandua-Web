import { TestBed, inject } from '@angular/core/testing';

import { DiagramPersistentSettingsService } from './diagram-persistent-settings.service';

describe('DiagramPersistentSettingsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DiagramPersistentSettingsService]
    });
  });

  it('should be created', inject([DiagramPersistentSettingsService], (service: DiagramPersistentSettingsService) => {
    expect(service).toBeTruthy();
  }));
});
