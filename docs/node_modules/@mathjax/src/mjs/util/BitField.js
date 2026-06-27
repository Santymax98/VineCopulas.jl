export class BitField {
    constructor() {
        this.bits = 0;
    }
    static allocate(...names) {
        for (const name of names) {
            if (this.has(name)) {
                throw new Error('Bit already allocated for ' + name);
            }
            if (this.next === BitField.MAXBIT) {
                throw new Error('Maximum number of bits already allocated');
            }
            this.names.set(name, this.next);
            this.next <<= 1;
        }
    }
    static has(name) {
        return this.names.has(name);
    }
    set(name) {
        this.bits |= this.getBit(name);
    }
    clear(name) {
        this.bits &= ~this.getBit(name);
    }
    isSet(name) {
        return !!(this.bits & this.getBit(name));
    }
    reset() {
        this.bits = 0;
    }
    getBit(name) {
        const bit = this.constructor.names.get(name);
        if (!bit) {
            throw new Error('Unknown bit-field name: ' + name);
        }
        return bit;
    }
}
BitField.MAXBIT = 1 << 31;
BitField.next = 1;
BitField.names = new Map();
export function BitFieldClass(...names) {
    const bits = class extends BitField {
    };
    bits.allocate(...names);
    return bits;
}
//# sourceMappingURL=BitField.js.map