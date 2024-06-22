import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MostImportantNodeTableComponent } from './most-important-node-table.component';

describe('MostImportantNodeTableComponent', () => {
  let component: MostImportantNodeTableComponent;
  let fixture: ComponentFixture<MostImportantNodeTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MostImportantNodeTableComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MostImportantNodeTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
