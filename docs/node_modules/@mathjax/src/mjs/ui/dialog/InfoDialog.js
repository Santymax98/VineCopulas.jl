import { DraggableDialog } from './DraggableDialog.js';
export class InfoDialog extends DraggableDialog {
    static post(args) {
        const dialog = new this(args);
        dialog.attach();
        return dialog;
    }
}
//# sourceMappingURL=InfoDialog.js.map