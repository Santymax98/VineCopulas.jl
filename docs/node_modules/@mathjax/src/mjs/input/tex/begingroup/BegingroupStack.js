import { HandlerType } from '../HandlerTypes.js';
import { CommandMap, EnvironmentMap, DelimiterMap, } from '../TokenMap.js';
import { MapHandler } from '../MapHandler.js';
import TexError from '../TexError.js';
import { NewcommandTables as NT, NewcommandPriority, } from '../newcommand/NewcommandUtil.js';
import ParseMethods from '../ParseMethods.js';
export class BegingroupStack {
    constructor(parser) {
        this.i = NewcommandPriority;
        this.top = NewcommandPriority;
        this.base = NewcommandPriority;
        this.MARKER = Symbol('marker');
        this.handlers = parser.handlers;
        this.getGlobal();
    }
    getGlobal() {
        this.global = {
            [NT.NEW_DELIMITER]: MapHandler.getMap(NT.NEW_DELIMITER),
            [NT.NEW_ENVIRONMENT]: MapHandler.getMap(NT.NEW_ENVIRONMENT),
            [NT.NEW_COMMAND]: MapHandler.getMap(NT.NEW_COMMAND),
        };
    }
    checkGlobal(tokens, maps) {
        for (const name of maps) {
            const token = tokens.shift();
            const handler = this.handlers.get(BegingroupStack.handlerMap[name]);
            this.global[name].add(token, this.MARKER);
            let item;
            do {
                const map = handler.applicable(token);
                item = map.lookup(token);
                map.remove(token);
            } while (item && item !== this.MARKER);
        }
        return maps.map((name) => this.global[name]);
    }
    push() {
        new DelimiterMap(NT.NEW_DELIMITER, ParseMethods.delimiter, {});
        new CommandMap(NT.NEW_COMMAND, {});
        new EnvironmentMap(NT.NEW_ENVIRONMENT, ParseMethods.environment, {});
        this.handlers.add(BegingroupStack.handlerConfig, {}, --this.i);
    }
    pop() {
        if (this.i === this.base) {
            throw new TexError('MissingBegingroup', 'Missing \\begingroup or extra \\endgroup');
        }
        this.handlers.remove(BegingroupStack.handlerConfig, {});
        for (const name of [NT.NEW_COMMAND, NT.NEW_ENVIRONMENT, NT.NEW_DELIMITER]) {
            MapHandler.register(this.handlers.retrieve(name));
        }
        this.i++;
    }
    finish() {
        this.top = this.i;
    }
    remove() {
        while (this.i < this.top) {
            this.pop();
        }
    }
    reset() {
        this.top = this.base;
        this.remove();
    }
    sandbox() {
        this.base = NewcommandPriority;
        this.reset();
        this.push();
        this.getGlobal();
        this.base = NewcommandPriority - 1;
    }
}
BegingroupStack.handlerConfig = {
    [HandlerType.DELIMITER]: [NT.NEW_DELIMITER],
    [HandlerType.ENVIRONMENT]: [NT.NEW_ENVIRONMENT],
    [HandlerType.MACRO]: [NT.NEW_DELIMITER, NT.NEW_COMMAND],
};
BegingroupStack.handlerMap = {
    [NT.NEW_DELIMITER]: HandlerType.DELIMITER,
    [NT.NEW_ENVIRONMENT]: HandlerType.ENVIRONMENT,
    [NT.NEW_COMMAND]: HandlerType.MACRO,
};
export function begingroupStack(parser) {
    return parser.packageData.get('begingroup').stack;
}
//# sourceMappingURL=BegingroupStack.js.map