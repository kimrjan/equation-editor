"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
var core_1 = require("@angular/core");
var rxjs_1 = require("rxjs");
var operators_1 = require("rxjs/operators");
var EventBusService = /** @class */ (function () {
    function EventBusService() {
        this.subject$ = new rxjs_1.Subject();
    }
    EventBusService.prototype.on = function (event, action) {
        return this.subject$
            .pipe(operators_1.filter(function (e) { return e.name === event; }), operators_1.map(function (e) { return e.value; }))
            .subscribe(action);
    };
    EventBusService.prototype.emit = function (event) {
        this.subject$.next(event);
    };
    EventBusService = __decorate([
        core_1.Injectable({
            providedIn: 'root'
        })
    ], EventBusService);
    return EventBusService;
}());
exports.EventBusService = EventBusService;
var EmitEvent = /** @class */ (function () {
    function EmitEvent(name, value) {
        this.name = name;
        this.value = value;
    }
    return EmitEvent;
}());
exports.EmitEvent = EmitEvent;
var Events;
(function (Events) {
    Events[Events["EquationChanged"] = 0] = "EquationChanged";
    Events[Events["NodeSelected"] = 1] = "NodeSelected";
    Events[Events["NewEquationSubmited"] = 2] = "NewEquationSubmited";
})(Events = exports.Events || (exports.Events = {}));
