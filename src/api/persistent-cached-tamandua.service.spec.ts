import { TestBed, inject } from '@angular/core/testing';

import { PersistentCachedTamanduaService } from './persistent-cached-tamandua.service';

describe('PersistentCachedTamanduaService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PersistentCachedTamanduaService]
    });
  });

  it('should be created', inject([PersistentCachedTamanduaService], (service: PersistentCachedTamanduaService) => {
    expect(service).toBeTruthy();
  }));
});
