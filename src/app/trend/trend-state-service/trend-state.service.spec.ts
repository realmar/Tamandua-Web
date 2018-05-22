import { TestBed, inject } from '@angular/core/testing';

import { TrendStateService } from './trend-state.service';

describe('TrendStateService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TrendStateService]
    });
  });

  it('should be created', inject([TrendStateService], (service: TrendStateService) => {
    expect(service).toBeTruthy();
  }));
});
