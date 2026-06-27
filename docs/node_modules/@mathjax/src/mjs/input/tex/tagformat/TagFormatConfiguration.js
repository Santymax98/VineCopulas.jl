import { ConfigurationType } from '../HandlerTypes.js';
import { Configuration } from '../Configuration.js';
import { TagsFactory } from '../Tags.js';
let tagID = 0;
export function tagformatConfig(config, jax) {
    const tags = jax.parseOptions.options.tags;
    if (tags !== 'base' && Object.hasOwn(config.tags, tags)) {
        TagsFactory.add(tags, config.tags[tags]);
    }
    const TagClass = TagsFactory.create(jax.parseOptions.options.tags)
        .constructor;
    class TagFormat extends TagClass {
        formatNumber(n) {
            return jax.parseOptions.options.tagformat.number(n);
        }
        formatTag(tag) {
            return jax.parseOptions.options.tagformat.tag(tag);
        }
        formatRef(tag) {
            const ref = jax.parseOptions.options.tagformat.ref;
            return ref ? ref(tag) : this.formatTag(tag);
        }
        formatId(id) {
            return jax.parseOptions.options.tagformat.id(id);
        }
        formatUrl(id, base) {
            return jax.parseOptions.options.tagformat.url(id, base);
        }
    }
    tagID++;
    const tagName = 'configTags-' + tagID;
    TagsFactory.add(tagName, TagFormat);
    jax.parseOptions.options.tags = tagName;
}
export const TagFormatConfiguration = Configuration.create('tagformat', {
    [ConfigurationType.CONFIG]: [tagformatConfig, 10],
    [ConfigurationType.OPTIONS]: {
        tagformat: {
            number: (n) => n.toString(),
            tag: (tag) => ['(', tag, ')'],
            ref: '',
            id: (id) => 'mjx-eqn:' + id.replace(/\s/g, '_'),
            url: (id, base) => base + '#' + encodeURIComponent(id),
        },
    },
});
//# sourceMappingURL=TagFormatConfiguration.js.map