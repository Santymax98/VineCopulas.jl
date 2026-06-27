import { HandlerType, ConfigurationType } from '../HandlerTypes.js';
import { ArrayItem } from '../base/BaseItems.js';
import { Configuration, ConfigurationHandler, } from '../Configuration.js';
import { CommandMap } from '../TokenMap.js';
import TexError from '../TexError.js';
export class ColorArrayItem extends ArrayItem {
    constructor() {
        super(...arguments);
        this.color = {
            cell: '',
            row: '',
            col: [],
        };
        this.hasColor = false;
    }
    EndEntry() {
        super.EndEntry();
        const cell = this.row[this.row.length - 1];
        const color = this.color.cell || this.color.row || this.color.col[this.row.length - 1];
        if (color) {
            cell.attributes.set('mathbackground', color);
            this.color.cell = '';
            this.hasColor = true;
        }
    }
    EndRow() {
        super.EndRow();
        this.color.row = '';
    }
    createMml() {
        const mml = super.createMml();
        let table = mml.isKind('mrow') ? mml.childNodes[1] : mml;
        if (table.isKind('mstyle')) {
            table = table.childNodes[0].childNodes[0];
        }
        if (table.isKind('menclose')) {
            table = table.childNodes[0].childNodes[0];
        }
        if (this.hasColor) {
            const attributes = table.attributes;
            if (attributes.get('frame') === 'none' &&
                attributes.get('data-frame-styles') === undefined) {
                attributes.set('data-frame-styles', '');
            }
        }
        return mml;
    }
}
function TableColor(parser, name, type) {
    const lookup = parser.configuration.packageData.get('color').model;
    const model = parser.GetBrackets(name, '');
    const color = lookup.getColor(model, parser.GetArgument(name));
    const top = parser.stack.Top();
    if (!(top instanceof ColorArrayItem)) {
        throw new TexError('UnsupportedTableColor', 'Unsupported use of %1', parser.currentCS);
    }
    if (type === 'col') {
        if (top.table.length && top.color.col[top.row.length] !== color) {
            throw new TexError('ColumnColorNotTop', '%1 must be in the top row or preamble', name);
        }
        top.color.col[top.row.length] = color;
        if (parser.GetBrackets(name, '')) {
            parser.GetBrackets(name, '');
        }
    }
    else {
        top.color[type] = color;
        if (type === 'row' && (top.Size() || top.row.length)) {
            throw new TexError('RowColorNotFirst', '%1 must be at the beginning of a row', name);
        }
    }
}
new CommandMap('colortbl', {
    cellcolor: [TableColor, 'cell'],
    rowcolor: [TableColor, 'row'],
    columncolor: [TableColor, 'col'],
});
const config = function (config, jax) {
    if (!jax.parseOptions.packageData.has('color')) {
        ConfigurationHandler.get('color').config(config, jax);
    }
};
export const ColortblConfiguration = Configuration.create('colortbl', {
    [ConfigurationType.HANDLER]: { [HandlerType.MACRO]: ['colortbl'] },
    [ConfigurationType.ITEMS]: { array: ColorArrayItem },
    [ConfigurationType.PRIORITY]: 10,
    [ConfigurationType.CONFIG]: [config, 10],
});
//# sourceMappingURL=ColortblConfiguration.js.map