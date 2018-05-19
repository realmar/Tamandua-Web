import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchResultDetailsModalComponent } from './search-result-details-modal.component';

describe('SearchResultDetailsModalComponent', () => {
  let component: SearchResultDetailsModalComponent;
  let fixture: ComponentFixture<SearchResultDetailsModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchResultDetailsModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchResultDetailsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
