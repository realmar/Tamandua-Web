import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchAddColumnsComponent } from './search-add-columns.component';

describe('SearchAddColumnsComponent', () => {
  let component: SearchAddColumnsComponent;
  let fixture: ComponentFixture<SearchAddColumnsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchAddColumnsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchAddColumnsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
