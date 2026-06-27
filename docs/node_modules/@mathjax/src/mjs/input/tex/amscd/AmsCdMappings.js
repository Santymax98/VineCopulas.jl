import * as tm from '../TokenMap.js';
import ParseMethods from '../ParseMethods.js';
import AmsCdMethods from './AmsCdMethods.js';
new tm.EnvironmentMap('amscd_environment', ParseMethods.environment, {
    CD: AmsCdMethods.CD,
});
new tm.CommandMap('amscd_macros', {
    minCDarrowwidth: AmsCdMethods.minCDarrowwidth,
    minCDarrowheight: AmsCdMethods.minCDarrowheight,
});
new tm.MacroMap('amscd_special', { '@': AmsCdMethods.arrow });
//# sourceMappingURL=AmsCdMappings.js.map