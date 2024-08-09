import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListUtilsateursComponent } from './list-utilsateurs.component';

describe('ListUtilsateursComponent', () => {
  let component: ListUtilsateursComponent;
  let fixture: ComponentFixture<ListUtilsateursComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListUtilsateursComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListUtilsateursComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
