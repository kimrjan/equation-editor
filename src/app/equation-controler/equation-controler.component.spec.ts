/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { EquationControlerComponent } from './equation-controler.component';

describe('EquationControlerComponent', () => {
  let component: EquationControlerComponent;
  let fixture: ComponentFixture<EquationControlerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EquationControlerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EquationControlerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
