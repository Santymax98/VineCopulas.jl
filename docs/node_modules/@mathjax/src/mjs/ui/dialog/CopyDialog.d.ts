import { InfoDialog, InfoDialogArgs } from './InfoDialog.js';
export type CopyDialogArgs = InfoDialogArgs & {
    code?: boolean;
};
export declare class CopyDialog extends InfoDialog {
    static post(args: CopyDialogArgs): import("./DraggableDialog.js").DraggableDialog;
    protected html(args: CopyDialogArgs): HTMLDialogElement;
    protected formatSource(text: string): string;
}
