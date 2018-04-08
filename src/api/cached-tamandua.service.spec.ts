import { TestBed, inject } from '@angular/core/testing';

import { CachedTamanduaService } from './cached-tamandua.service';

describe('CachedTamanduaService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CachedTamanduaService]
    });
  });

  it('should be created', inject([CachedTamanduaService], (service: CachedTamanduaService) => {
    expect(service).toBeTruthy();
  }));
});
