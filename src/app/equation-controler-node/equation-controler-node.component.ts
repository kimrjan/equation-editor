import { Component, Input } from '@angular/core';
import { EmitEvent, EventBusService, Events } from '../core/event-bus.service';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { MathNode } from '../equation/math-node';
import * as nerdamer from 'nerdamer';

@Component({
    selector: 'app-equation-controler-node',
    templateUrl: './equation-controler-node.component.html',
    styleUrls: ['./equation-controler-node.component.css']
})
export class EquationControlerNodeComponent {
    @Input() node: MathNode;
    @Input() fontSize: string;

    lBracket = '(';
    rBracket = ')';

    constructor(private eventbus: EventBusService) { }

    /**
     * Changes position of dragged element according to event
     * @param event CdkDragDrop<any>
     */
    drop(event: CdkDragDrop<any>) {
        if (event.previousContainer === event.container) {
            moveItemInArray(event.container.data.value, event.previousIndex, event.currentIndex);
        } else {
            if (event.previousContainer.data.value !== event.container.data.value) {
                event.previousContainer.data.value[event.previousIndex].changeSign();
            }

            transferArrayItem(event.previousContainer.data.value,
                event.container.data.value,
                event.previousIndex,
                event.currentIndex);
        }
        this.eventbus.emit(new EmitEvent(Events.EquationChanged, event));
    }

    selectNode(item: MathNode) {
        if (item.toString() !== '0') {
            this.eventbus.emit(new EmitEvent(Events.NodeSelected, item));
        }
    }

    isArray(nodeValue: any) {
        return Array.isArray(nodeValue);
    }

    hasBrackets(item: MathNode) {
        return this.isArray(item.value) && item.value[0].sign !== '*' && item.value[0].sign !== '/' && item.sign !== '/';
    }

    hasSign(item: MathNode, i: number) {
        if (item.sign === '/') {
            return false;
        }
        if (i !== 0 || (item.sign !== '+' && item.sign !== '*')) {
            return true;
        }

        return false;
    }

    isDisabled(item: MathNode) {
        return item.value === '0' || item.sign === '/';
    }

    getCssClasses(item: MathNode, i: number) {
        /* tslint:disable:no-string-literal */
        const classes = {};
        if (item.selected) {
            classes['selected'] = true;
        }
        if (item.sign !== '/') {
            classes['node'] = true;
        }
        if (item.sign === '/' && i === 0) {
            classes['fraction-top'] = true;
        }
        if (item.sign === '/' && i === 1) {
            classes['fraction-bottom'] = true;
        }
        /* tslint:disable:no-string-literal */
        return classes;
    }

    getAsLaTeX(expression: string) {
        return nerdamer.convertToLaTeX(expression);
    }

    getSize() {
        return this.fontSize + 'rem';
    }
}
