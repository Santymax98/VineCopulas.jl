import { HandlerType, ConfigurationType } from '../HandlerTypes.js';
import { Configuration } from '../Configuration.js';
import { CommandMap } from '../TokenMap.js';
import HtmlMethods from './HtmlMethods.js';
new CommandMap('html_macros', {
    data: HtmlMethods.Data,
    href: HtmlMethods.Href,
    class: HtmlMethods.Class,
    style: HtmlMethods.Style,
    cssId: HtmlMethods.Id,
});
export const HtmlConfiguration = Configuration.create('html', {
    [ConfigurationType.HANDLER]: { [HandlerType.MACRO]: ['html_macros'] },
});
//# sourceMappingURL=HtmlConfiguration.js.map