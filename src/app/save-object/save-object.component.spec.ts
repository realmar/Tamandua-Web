import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SaveObjectComponent } from './save-object.component';

describe('SaveObjectComponent', () => {
  let component: SaveObjectComponent;
  let fixture: ComponentFixture<SaveObjectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SaveObjectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SaveObjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
