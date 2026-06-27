import { ConfigurationType } from '../HandlerTypes.js';
import { Configuration } from '../Configuration.js';
function noErrors(factory, message, _id, expr) {
    const mtext = factory.create('token', 'mtext', {}, expr.replace(/\n/g, ' '));
    const error = factory.create('node', 'merror', [mtext], {
        'data-mjx-error': message,
        title: message,
    });
    return error;
}
export const NoErrorsConfiguration = Configuration.create('noerrors', {
    [ConfigurationType.NODES]: { error: noErrors },
});
//# sourceMappingURL=NoErrorsConfiguration.js.map