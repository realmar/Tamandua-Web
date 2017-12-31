import { TestBed, inject } from '@angular/core/testing';

import { TamanduaMockService } from './tamandua-mock.service';

describe('TamanduaMockService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TamanduaMockService]
    });
  });

  it('should be created', inject([TamanduaMockService], (service: TamanduaMockService) => {
    expect(service).toBeTruthy();
  }));
});
