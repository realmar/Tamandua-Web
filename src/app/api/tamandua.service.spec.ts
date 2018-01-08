import { TestBed, inject } from '@angular/core/testing';

import { TamanduaService } from './tamandua.service';

describe('TamanduaService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TamanduaService]
    });
  });

  it('should be created', inject([TamanduaService], (service: TamanduaService) => {
    expect(service).toBeTruthy();
  }));
});
