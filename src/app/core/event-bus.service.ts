/**
 * This part of code is from https://github.com/DanWahlin/Angular-JumpStart/blob/master/src/app/core/services/event-bus.service.ts
 * from Dan Wahlin: https://github.com/DanWahlin
 * licenced under MIT Licence
 */

import { Injectable } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class EventBusService {

    private subject$ = new Subject();

    on(event: Events, action: any): Subscription {
         return this.subject$
              .pipe(
                    filter((e: EmitEvent) => e.name === event),
                    map((e: EmitEvent) => e.value)
                  )
              .subscribe(action);
    }

    emit(event: EmitEvent) {
        this.subject$.next(event);
    }
}

export class EmitEvent {
  constructor(public name: any, public value?: any) { }
}


export enum Events {
  EquationChanged,
  NodeSelected,
  NewEquationSubmited
}
