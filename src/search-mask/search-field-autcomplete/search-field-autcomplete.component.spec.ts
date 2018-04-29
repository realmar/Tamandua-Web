import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchFieldAutocompleteComponent } from './search-field-autocomplete.component';

describe('SearchFieldAutocompleteComponent', () => {
  let component: SearchFieldAutocompleteComponent;
  let fixture: ComponentFixture<SearchFieldAutocompleteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchFieldAutocompleteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchFieldAutocompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
