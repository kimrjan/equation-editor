import { faArrowAltCircleUp, faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { MathNode } from './../equation/math-node';
import { Equation } from './../equation/equation';
import { Component, ElementRef, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { EventBusService, Events } from '../core/event-bus.service';
import * as nerdamer from 'nerdamer';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-equation-controler',
    templateUrl: './equation-controler.component.html',
    styleUrls: ['./equation-controler.component.css']
})

export class EquationControlerComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('previewContainer') previewContainer: ElementRef;

    equation: Equation;

    eventbusSub: Subscription;
    edits: Array<string>;
    removedEdits: Array<string>;

    lastTestedSelected: MathNode;
    selection: Array<MathNode>;
    userInputExpression: string;
    userInputMathNodeString: string;
    expressionPreviewWidth: number;
    errMessage: string;

    equationSign = '=';
    faQuestionCircle = faQuestionCircle;
    faArrowUp = faArrowAltCircleUp;
    showFiller = true;
    paramEquation: string;

    constructor(private eventbus: EventBusService, private route: ActivatedRoute) {
        this.edits = [];
        this.removedEdits = [];

        this.lastTestedSelected = new MathNode();
        this.selection = [];
        this.userInputExpression = '';
        this.userInputMathNodeString = '';
        this.errMessage = '';

        this.route.queryParams.subscribe(params => {
            /* tslint:disable:no-string-literal */
            this.paramEquation = params['equation'];
            /* tslint:disable:no-string-literal */

            if (this.paramEquation !== undefined) {
                this.paramEquation = this.paramEquation.substring(1, this.paramEquation.length - 1);
                console.log(decodeURIComponent(this.paramEquation));

                this.equation = new Equation(this.paramEquation.split('=')[0], this.paramEquation.split('=')[1]);
            } else {
                this.equation = new Equation('1+(1+4*(2+9))', '2x-2');
            }
            this.addEdit();
        });
    }

    ngOnInit() {
        this.eventbusSub = this.eventbus.on(Events.EquationChanged, () => {
            this.clearSelection();
            this.equation.correctStructure();
            this.addEdit();
        });

        this.eventbusSub = this.eventbus.on(Events.NodeSelected, (newSelected: MathNode) => {
            if (newSelected.isChildOf(this.lastTestedSelected)) {
                this.lastTestedSelected = newSelected;
                return;
            }

            if (newSelected.selected && this.equation.areMathNodesSibilings(newSelected, this.selection[0])) {
                this.selection.splice(this.selection.indexOf(newSelected), 1);
                newSelected.setSelected(false);
                this.lastTestedSelected = newSelected;
                return;
            }

            if (this.selection.length !== 0 && this.equation.areMathNodesSibilings(newSelected, this.selection[0])) {
                if (this.selection.indexOf(newSelected) === -1) {
                    this.selection.push(newSelected);
                }
            } else {
                this.clearSelection();
                this.selection.push(newSelected);
            }


            if (this.selection.length === 2 && this.selection[0].sign === '/') {

                const fraction = this.equation.findParentNode(this.selection[0]);
                if (fraction !== null) {
                    this.selection = [fraction];
                }
            }

            this.selection.forEach(element => {
                element.setSelected(true);
            });
            this.lastTestedSelected = newSelected;
        });

        this.eventbusSub = this.eventbus.on(Events.NewEquationSubmited, (eqation: Equation) => {
            this.equation = eqation;
            this.edits = [];
            this.addEdit();
        });
    }

    ngAfterViewInit() {
        this.expressionPreviewWidth = this.previewContainer.nativeElement.offsetWidth;
    }

    ngOnDestroy() {
        this.eventbusSub.unsubscribe();
    }

    actualizeUserInput(value: string): void {
        this.userInputExpression = value;
        this.errMessage = '';
        this.checkInput(-1);
        this.userInputMathNodeString = (new MathNode('', this.userInputExpression, true)).toString();
    }


    checkInput(operation: number): void {
        enum Operations {
            EditEquation,
            MultiplyEquation,
            DivideEquation
        }
        this.errMessage = '';

        // invalid chars
        const invalidChars = this.userInputExpression.match(/[^a-z0-9+*/()-\s.]/gi);
        if (invalidChars !== null) {
            if (invalidChars.length === 1) {
                this.errMessage += `Výraz nesmí obsahovat znak ${invalidChars[0]}.`;
            } else {
                this.errMessage += `Výraz nesmí obsahovat znaky`;
                for (let i = 0; i < invalidChars.length; i++) {
                    this.errMessage += ` ${invalidChars[i]}` + (i !== invalidChars.length - 1 ? ', ' : '.');
                }
            }
            return;
        }

        const expression: MathNode = new MathNode('', this.userInputExpression);

        let expressionVariables = expression.findVariables();
        const equationVariable = this.equation.getVariable();
        expressionVariables = expressionVariables.replace(equationVariable, '');

        if (expressionVariables.length !== 0) {
            if (expressionVariables.length === 1) {
                this.errMessage += `Výraz nesmí obsahovat neznámou ${expressionVariables}.\n`;
            } else {
                this.errMessage += `Výraz nesmí obsahovat neznámé`;
                for (let i = 0; i < expressionVariables.length; i++) {
                    this.errMessage += ` ${expressionVariables[i]}` + (i !== expressionVariables.length - 1 ? ', ' : '.\n');
                }
            }
        }

        if (!expression.isValid()) {
            this.errMessage += 'Výraz obsahuje chybu.';
            return;
        }

        if (operation === Operations.EditEquation) {
            if (this.selection.length === 0) {
                this.errMessage += 'Není vybrán žádný výraz k nahrazení.';
                return;
            }

            const selectedExpression = new MathNode('', this.selection, true);
            if (!MathNode.areExpEqual(selectedExpression, expression)) {
                this.errMessage += 'Hodnota vybraného výrazu není sejná jako hodnota napsaného výrazu.\n';
            }

        } else if (operation === Operations.MultiplyEquation) {
            if (MathNode.areExpEqual(new MathNode('', 0), expression)) {
                this.errMessage += 'Rovnici nelze násobit výrazem rovným nule.\n';
            }
            if (expression.findVariables().length !== 0) {
                this.errMessage += 'Rovnici nelze násobit výrazem obsahujícím neznámou.\n';
            }

        } else if (operation === Operations.DivideEquation) {
            if (MathNode.areExpEqual(new MathNode('', 0), expression)) {
                this.errMessage += 'Rovnici nelze dělit výrazem rovným nule.\n';
            }
            if (expression.findVariables().length !== 0) {
                this.errMessage += 'Rovnici nelze dělit výrazem obsahujícím neznámou.\n';
            }
        }
        this.errMessage = this.errMessage.substr(0, this.errMessage.length - 1);
    }

    /**
     * Replaces selected MathNodes by value of userInputExpression if possible.
     */
    editEquation() {
        this.checkInput(0);

        if (this.errMessage.length === 0) {
            let expression: MathNode = new MathNode('', this.userInputExpression);

            if (!Array.isArray(expression.value)) {
                if (this.selection[0].sign === '/' && expression.sign === '-') {
                    expression = new MathNode('+', [expression]);
                }
                if (this.selection[0].sign.match(/[\*\/]/) === null) {
                    this.selection[0].sign = expression.sign;
                }
                this.selection[0].value = expression.value;
            } else {
                if (expression.value[0].sign === '/' || expression.value[0].sign === '+' || expression.value[0].sign === '*') {
                    this.selection[0].value = expression.value;
                    this.selection[0].setSelected(false);
                } else {
                    if (expression.value.length === 1) {
                        this.selection[0].sign = expression.value[0].sign;
                        this.selection[0].value = expression.value[0].value;
                        this.selection[0].setSelected(false);
                    } else {
                        this.selection[0].value = expression.value;
                    }

                }

            }

            for (let i = 1; i < this.selection.length; i++) {
                this.selection[i].value = '0';
            }
            this.equation.correctStructure();
            this.clearSelection();
            this.addEdit();
        }
    }

    /**
     * Expands both sides of equation by value of userInputExpression if possible.
     */
    multiplyEquation() {
        this.checkInput(1);

        if (this.errMessage.length === 0) {
            this.equation.multiply(this.userInputExpression);
            this.clearSelection();
            this.addEdit();
        }
    }

    /**
     * Divides both sides of equation by value of userInputExpression if possible.
     */
    divideEquation() {
        this.checkInput(2);

        if (this.errMessage.length === 0) {
            this.equation.divide(this.userInputExpression);
            this.clearSelection();
            this.addEdit();
        }
    }

    /**
     * Swaps sides of equation.
     */
    swapSides(): void {
        this.equation.swapSides();
        this.addEdit();
    }

    addEdit() {
        if (this.edits[this.edits.length - 1] !== this.equation.toString()) {
            this.edits.push(this.equation.toString());
        }

        this.removedEdits = [];
    }

    back() {
        this.removedEdits.push(this.edits.pop());
        const last = this.edits[this.edits.length - 1];
        this.equation = new Equation(last.split('=')[0], last.split('=')[1]);
    }

    next() {
        const next = this.removedEdits.pop();
        this.edits.push(next);
        this.equation = new Equation(next.split('=')[0], next.split('=')[1]);
    }
    /**
     * Clears value of selection and selected. Deselects all selected nodes.
     */
    clearSelection(): void {
        this.equation.deselectNodes();
        this.selection = [];
    }

    calcEditorFontSize() {
        if (this.equation.toString().length === 0) {
            return '3rem';
        }
        let size = 67.5 / this.equation.toString().length - 0.75;
        if (size > 3) {
            size = 3;
        }
        if (size < 1.5) {
            size = 1.5;
        }
        return size + 'rem';
    }

    calcFontSize() {
        if (this.userInputMathNodeString.length === 0) {
            return '2rem';
        }
        const length = this.userInputMathNodeString.length;
        let size = 2;
        let textLengthPx = this.expressionPreviewWidth;
        if (this.expressionPreviewWidth !== 0) {
            textLengthPx = 17 * length - 5;
            size = this.expressionPreviewWidth / textLengthPx;
        }
        if (size > 2.5) {
            size = 2.5;
        }

        size -= 0.05;
        return size + 'rem';
    }

    getAsLaTeX(expression: string) {
        try {
            return nerdamer.convertToLaTeX(expression);
        } catch (error) {
            this.errMessage = 'Náhled není k dispozici';
        }
    }

    /**
     * Prints value of equation as two MathNodes to console.
     */
    print() {
        console.log(this.equation.toString());
        console.log(this.equation.leftSide);
        console.log(this.equation.rightSide);
    }

    scroll(el: HTMLElement) {
        el.scrollIntoView();
    }
}
