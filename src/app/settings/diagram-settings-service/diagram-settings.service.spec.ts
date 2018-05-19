import { TestBed, inject } from '@angular/core/testing';

import { DiagramSettingsService } from './diagram-settings.service';

describe('DiagramSettingsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DiagramSettingsService]
    });
  });

  it('should be created', inject([DiagramSettingsService], (service: DiagramSettingsService) => {
    expect(service).toBeTruthy();
  }));
});
