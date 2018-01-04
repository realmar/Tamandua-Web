import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchResultAddColumnsModalComponent } from './search-result-add-columns-modal.component';

describe('SearchResultAddColumnsModalComponent', () => {
  let component: SearchResultAddColumnsModalComponent;
  let fixture: ComponentFixture<SearchResultAddColumnsModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchResultAddColumnsModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchResultAddColumnsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
