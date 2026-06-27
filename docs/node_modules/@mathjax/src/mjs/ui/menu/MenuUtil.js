import { context } from '../../util/context.js';
export const isMac = context.os === 'MacOS';
export function copyToClipboard(text) {
    const document = context.document;
    const input = document.createElement('textarea');
    input.value = text;
    input.setAttribute('readonly', '');
    input.style.cssText =
        'height: 1px; width: 1px; padding: 1px; position: absolute; left: -10px';
    document.body.appendChild(input);
    input.select();
    try {
        document.execCommand('copy');
    }
    catch (error) {
        alert(`Can't copy to clipboard: ${error.message}`);
    }
    document.body.removeChild(input);
}
//# sourceMappingURL=MenuUtil.js.map