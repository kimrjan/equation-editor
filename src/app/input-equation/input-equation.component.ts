import { MathNode } from './../equation/math-node';
import { Equation } from './../equation/equation';
import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { EmitEvent, EventBusService, Events } from '../core/event-bus.service';
import { Clipboard } from '@angular/cdk/clipboard';
import * as nerdamer from 'nerdamer';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

@Component({
    selector: 'app-input-equation',
    templateUrl: './input-equation.component.html',
    styleUrls: ['./input-equation.component.scss']
})

export class InputEquationComponent implements AfterViewInit {
    @ViewChild('previewContainer') previewContainer: ElementRef;

    equation: Equation;
    equationAsString: string;
    inputEquation: string;
    errMessage: string;
    clipboardString: string;

    equationPreviewWidth: number;

    constructor(private eventbus: EventBusService, private router: Router, private clipboard: Clipboard, private location: Location) {
        this.equationAsString = '';
        this.inputEquation = '';
        this.errMessage = '';
        this.clipboardString = 'aaaaa';
        this.equationPreviewWidth = 0;
    }

    ngAfterViewInit() {
        this.equationPreviewWidth = this.previewContainer.nativeElement.offsetWidth;
    }

    parseEquation(inputString: string) {
        this.equationAsString = inputString;
        if (!inputString.includes('=')) {
            this.checkInput(false);
            if (this.errMessage.length === 0) {
                this.equationAsString = (new MathNode('', this.equationAsString, true)).toString();
            }
            return;
        }

        const left = inputString.split('=')[0];
        const right = inputString.split('=')[1];

        if (left.length === 0 || right.length === 0) {
            this.checkInput(false);
            if (this.errMessage.length === 0) {
                this.equationAsString = (new MathNode('', this.equationAsString, true)).toString();
            }
            return;
        }

        this.equation = new Equation(left, right);
        this.checkInput(true);
        this.equationAsString = this.equation.toString();
    }

    checkInput(equationExists: boolean): void {
        this.errMessage = '';
        if (this.equationAsString.length === 0) {
            this.errMessage = 'Nejprve napiště rovnici';
            return;
        }

        const invalidChars = this.equationAsString.match(/[^a-z0-9+*/()=-\s.]/gi);
        if (invalidChars !== null) {
            if (invalidChars.length === 1) {
                this.errMessage += `Rovnice nesmí obsahovat znak ${invalidChars[0]}.`;
            } else {
                this.errMessage += `Rovnice nesmí obsahovat znaky`;
                for (let i = 0; i < invalidChars.length; i++) {
                    this.errMessage += ` ${invalidChars[i]}` + (i !== invalidChars.length - 1 ? ', ' : '.');
                }
            }
            return;
        }

        if (equationExists) {
            const equationVariables = this.equation.getVariable();

            if (equationVariables.length === 0) {
                this.errMessage += 'Rovnice musí obsahovat jednu neznámou.\n';
            } else if (equationVariables.length > 1) {
                this.errMessage += 'Rovnice může obsahovat maximálně jednu neznámou.\n';
            }

            if (!this.equation.isValid()) {
                this.errMessage += 'Rovnice obsahuje chybu.\n';
            }
        } else {
            const expression = (new MathNode('', this.equationAsString, true));
            const equationVariables = expression.findVariables();
            if (equationVariables.length === 0) {
                this.errMessage += 'Rovnice musí obsahovat jednu neznámou.\n';
            } else if (equationVariables.length > 1) {
                this.errMessage += 'Rovnice může obsahovat maximálně jednu neznámou.\n';
            }


            if (!expression.isValid()) {
                this.errMessage += 'Rovnice obsahuje chybu.\n';
            }
            this.errMessage += 'Rovnice není kompletní.\n';
        }
        this.errMessage = this.errMessage.substr(0, this.errMessage.length - 1);
    }

    submit() {
        this.checkInput(true);
        if (this.errMessage.length === 0) {
            this.equation.correctStructure();
            this.eventbus.emit(new EmitEvent(Events.NewEquationSubmited, this.equation.getCopy()));
            this.errMessage = 'Rovnice byla vložena do editoru.';
        } else {
            this.errMessage += '\nRovnice nebyla vložena.';
        }
    }

    getAsLaTeX(expression: string) {
        try {
            return nerdamer.convertToLaTeX(expression);
        } catch (error) {
            this.errMessage = 'Náhled není k dispozici.';
        }
    }

    calcFontSize() {
        if (this.equationAsString.length === 0) {
            return '2rem';
        }
        let length = this.equationAsString.length;
        if (this.errMessage.length === 0 && this.equation !== undefined) {
            length = this.equation.toString().length;
        }
        let size = 2;
        let textLengthPx = this.equationPreviewWidth;
        if (this.equationPreviewWidth !== 0) {
            textLengthPx = 17 * length - 5;
            size = this.equationPreviewWidth / textLengthPx;
        }
        if (size > 2.5) {
            size = 2.5;
        }

        size -= 0.05;
        return size + 'rem';
    }

    copyToClipboard() {
        this.checkInput(true);
        if (this.errMessage.length === 0) {
            this.equation.correctStructure();
            const parsedUrl = new URL(window.location.href);
            const baseUrl = parsedUrl.origin;

            this.clipboard.copy(baseUrl + '?equation="' + encodeURIComponent(this.equation.toString()) + '"');
            this.errMessage = 'Rovnice byla zkopírována.';
        } else {
            this.errMessage += '\nRovnice nebyla zkopírována.';
        }
    }
}
