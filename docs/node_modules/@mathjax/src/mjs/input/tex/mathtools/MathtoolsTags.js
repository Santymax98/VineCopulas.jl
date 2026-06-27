import TexError from '../TexError.js';
import { TagsFactory } from '../Tags.js';
let tagID = 0;
export function MathtoolsTagFormat(config, jax) {
    const tags = jax.parseOptions.options.tags;
    if (tags !== 'base' && Object.hasOwn(config.tags, tags)) {
        TagsFactory.add(tags, config.tags[tags]);
    }
    const TagClass = TagsFactory.create(jax.parseOptions.options.tags)
        .constructor;
    class TagFormat extends TagClass {
        constructor() {
            super();
            this.mtFormats = new Map();
            this.mtCurrent = null;
            const forms = jax.parseOptions.options.mathtools.tagforms;
            for (const form of Object.keys(forms)) {
                if (!Array.isArray(forms[form]) || forms[form].length !== 3) {
                    throw new TexError('InvalidTagFormDef', 'The tag form definition for "%1" should be an array of three strings', form);
                }
                this.mtFormats.set(form, forms[form]);
            }
        }
        formatTag(tag) {
            if (this.mtCurrent) {
                const [left, right, format] = this.mtCurrent;
                return [left, format ? `${format}{${tag}}` : tag, right];
            }
            return super.formatTag(tag);
        }
    }
    tagID++;
    const tagName = 'MathtoolsTags-' + tagID;
    TagsFactory.add(tagName, TagFormat);
    jax.parseOptions.options.tags = tagName;
}
//# sourceMappingURL=MathtoolsTags.js.map