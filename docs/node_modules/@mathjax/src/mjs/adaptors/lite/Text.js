export class LiteText {
    get kind() {
        return '#text';
    }
    constructor(text = '') {
        this.value = text;
    }
}
export class LiteComment extends LiteText {
    get kind() {
        return '#comment';
    }
}
//# sourceMappingURL=Text.js.map