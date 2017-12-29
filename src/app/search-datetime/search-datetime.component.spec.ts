import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchDatetimeComponent } from './search-datetime.component';

describe('SearchDatetimeComponent', () => {
  let component: SearchDatetimeComponent;
  let fixture: ComponentFixture<SearchDatetimeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchDatetimeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchDatetimeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
