class TexError {
    static processString(str, args) {
        const parts = str.split(TexError.pattern);
        for (let i = 1, m = parts.length; i < m; i += 2) {
            let c = parts[i].charAt(0);
            if (c >= '0' && c <= '9') {
                parts[i] = args[parseInt(parts[i], 10) - 1];
                if (typeof parts[i] === 'number') {
                    parts[i] = parts[i].toString();
                }
            }
            else if (c === '{') {
                c = parts[i].substring(1);
                if (c >= '0' && c <= '9') {
                    parts[i] =
                        args[parseInt(parts[i].substring(1, parts[i].length - 1), 10) - 1];
                    if (typeof parts[i] === 'number') {
                        parts[i] = parts[i].toString();
                    }
                }
                else {
                    const match = parts[i].match(/^\{([a-z]+):%(\d+)\|(.*)\}$/);
                    if (match) {
                        parts[i] = '%' + parts[i];
                    }
                }
            }
        }
        return parts.join('');
    }
    constructor(id, message, ...rest) {
        this.id = id;
        this.message = TexError.processString(message, rest);
    }
}
TexError.pattern = /%(\d+|\{\d+\}|\{[a-z]+:%\d+(?:\|(?:%\{\d+\}|%.|[^}])*)+\}|.)/g;
export default TexError;
//# sourceMappingURL=TexError.js.map