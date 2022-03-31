class NodeElementCSSStyleDeclaration extends CSSStyleDeclaration {
    x!: string
    y!: string
    transform!: string

    get x_as_number() {
        return parseFloat(this.x)
    }

    get y_as_number() {
        return parseFloat(this.y)
    }
}

export { NodeElementCSSStyleDeclaration }
