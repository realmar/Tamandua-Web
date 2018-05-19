import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchResultTagsSelectionComponent } from './search-result-tags-selection.component';

describe('SearchResultTagsSelectionComponent', () => {
  let component: SearchResultTagsSelectionComponent;
  let fixture: ComponentFixture<SearchResultTagsSelectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchResultTagsSelectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchResultTagsSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
