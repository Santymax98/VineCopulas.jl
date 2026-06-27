import { InfoDialog } from './InfoDialog.js';
export class CopyDialog extends InfoDialog {
    static post(args) {
        return super.post(args);
    }
    html(args) {
        var _a;
        (_a = args.extraNodes) !== null && _a !== void 0 ? _a : (args.extraNodes = []);
        const copy = args.adaptor.node('input', {
            type: 'button',
            value: 'Copy to Clipboard',
            'data-drag': 'none',
        });
        copy.addEventListener('click', this.copyToClipboard.bind(this));
        args.extraNodes.push(copy);
        if (args.code) {
            args.message = '<pre>' + this.formatSource(args.message) + '</pre>';
        }
        return super.html(args);
    }
    formatSource(text) {
        return text
            .trim()
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }
}
//# sourceMappingURL=CopyDialog.js.map