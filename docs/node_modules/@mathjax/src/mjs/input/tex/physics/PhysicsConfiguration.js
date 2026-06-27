import { HandlerType, ConfigurationType } from '../HandlerTypes.js';
import { Configuration } from '../Configuration.js';
import { AutoOpen } from './PhysicsItems.js';
import './PhysicsMappings.js';
export const PhysicsConfiguration = Configuration.create('physics', {
    [ConfigurationType.HANDLER]: {
        macro: [
            'Physics-automatic-bracing-macros',
            'Physics-vector-macros',
            'Physics-vector-mo',
            'Physics-vector-mi',
            'Physics-derivative-macros',
            'Physics-expressions-macros',
            'Physics-quick-quad-macros',
            'Physics-bra-ket-macros',
            'Physics-matrix-macros',
        ],
        [HandlerType.CHARACTER]: ['Physics-characters'],
        [HandlerType.ENVIRONMENT]: ['Physics-aux-envs'],
    },
    [ConfigurationType.ITEMS]: {
        [AutoOpen.prototype.kind]: AutoOpen,
    },
    [ConfigurationType.OPTIONS]: {
        physics: {
            italicdiff: false,
            arrowdel: false,
        },
    },
});
//# sourceMappingURL=PhysicsConfiguration.js.map