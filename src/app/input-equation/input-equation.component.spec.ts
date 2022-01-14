/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { InputEquationComponent } from './input-equation.component';

describe('InputEquationComponent', () => {
  let component: InputEquationComponent;
  let fixture: ComponentFixture<InputEquationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InputEquationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InputEquationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
