import { TestBed, inject } from '@angular/core/testing';

import { DiagramStateService } from './diagram-state.service';

describe('DiagramStateService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DiagramStateService]
    });
  });

  it('should be created', inject([DiagramStateService], (service: DiagramStateService) => {
    expect(service).toBeTruthy();
  }));
});
