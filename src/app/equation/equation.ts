import { MathNode } from './math-node';

export class Equation {
    uuid: string;
    leftSide: MathNode;
    rightSide: MathNode;

    constructor(leftSide: string, rightSide: string) {
        this.leftSide = new MathNode('', leftSide, true);
        this.rightSide = new MathNode('', rightSide, true);
        this.correctStructure();
    }

    swapSides(): void {
        const temp = this.leftSide;
        this.leftSide = this.rightSide;
        this.rightSide = temp;
    }

    multiply(expressionAsString: string) {
        const expression: MathNode = new MathNode('', expressionAsString);

        this.leftSide.multiply(expression);
        this.rightSide.multiply(expression);

        this.correctStructure();
    }

    divide(expressionAsString: string) {
        const expression: MathNode = new MathNode('', expressionAsString);

        this.leftSide.divide(expression);
        this.rightSide.divide(expression);

        this.correctStructure();
    }

    /**
     * Checks whether the Equation is mathematicly valid.
     */
    isValid(): boolean {
        return this.leftSide.isValid() && this.rightSide.isValid();
    }

    areMathNodesSibilings(firstNode: MathNode, secondNode: MathNode): boolean {
        return this.leftSide.areMathNodesSibilings(firstNode, secondNode) || this.rightSide.areMathNodesSibilings(firstNode, secondNode);
    }

    findParentNode(searchedMathNode: MathNode) {
        const mathNode = this.leftSide.findParentNode(searchedMathNode);
        if (mathNode !== null) {
            return mathNode;
        }
        return this.rightSide.findParentNode(searchedMathNode);
    }

    deselectNodes(): void {
        this.leftSide.value.forEach((element: MathNode) => {
            element.setSelected(false);
        });
        this.rightSide.value.forEach((element: MathNode) => {
            element.setSelected(false);
        });
    }

    correctStructure(): void {
        while (this.leftSide.correctStructure()) { }
        while (this.rightSide.correctStructure()) { }
    }

    /**
     * Returns copy of this.
     */
    getCopy(): Equation {
        return new Equation(this.leftSide.toString(), this.rightSide.toString());
    }

    getVariable(): string {
        return (this.leftSide.findVariables() + this.rightSide.findVariables()).split('')
            .filter((item, pos, self) => {
                return self.indexOf(item) === pos;
            })
            .join('');
    }

    toString(): string {
        return this.leftSide.toString() + '=' + this.rightSide.toString();
    }
}
