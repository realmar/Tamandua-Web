import { TestBed, inject } from '@angular/core/testing';

import { SearchPersistentStateService } from './search-persistent-state.service';

describe('SearchPersistentStateService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SearchPersistentStateService]
    });
  });

  it('should be created', inject([SearchPersistentStateService], (service: SearchPersistentStateService) => {
    expect(service).toBeTruthy();
  }));
});
