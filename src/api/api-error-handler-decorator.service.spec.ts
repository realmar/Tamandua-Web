import { TestBed, inject } from '@angular/core/testing';

import { ApiErrorHandlerDecoratorService } from './api-error-handler-decorator.service';

describe('ApiErrorHandlerDecoratorService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ApiErrorHandlerDecoratorService]
    });
  });

  it('should be created', inject([ApiErrorHandlerDecoratorService], (service: ApiErrorHandlerDecoratorService) => {
    expect(service).toBeTruthy();
  }));
});
