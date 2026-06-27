import * as MenuUtil from './MenuUtil.js';
export function showAnnotations(box, types, cache) {
    return (menu, sub, callback) => {
        getAnnotation(getSemanticNode(menu), types, cache);
        callback(createAnnotationMenu(menu, sub, cache, box));
    };
}
export function copyAnnotations(cache) {
    return (menu, sub, callback) => {
        const annotations = cache.slice();
        cache.length = 0;
        callback(createAnnotationMenu(menu, sub, annotations, () => MenuUtil.copyToClipboard(annotation.trim())));
    };
}
function getSemanticNode(menu) {
    var _a;
    let node = (_a = menu.mathItem) === null || _a === void 0 ? void 0 : _a.root;
    while (node && !node.isKind('semantics')) {
        if (node.isToken || node.childNodes.length !== 1)
            return null;
        node = node.childNodes[0];
    }
    return node;
}
function getAnnotation(node, types, annotations) {
    if (!node)
        return;
    for (const child of node.childNodes) {
        if (child.isKind('annotation')) {
            const match = annotationMatch(child, types);
            if (match) {
                const value = child.childNodes.reduce((text, chars) => text + chars.toString(), '');
                annotations.push([match, value]);
            }
        }
    }
}
function annotationMatch(child, types) {
    const encoding = child.attributes.get('encoding');
    for (const type of Object.keys(types)) {
        if (types[type].includes(encoding)) {
            return type;
        }
    }
    return null;
}
export let annotation = '';
function createAnnotationMenu(menu, submenu, annotations, action) {
    return menu.factory.get('subMenu')(menu.factory, {
        items: annotations.map(([type, value]) => {
            return {
                type: 'command',
                id: type,
                content: type,
                action: () => {
                    annotation = value;
                    action();
                },
            };
        }),
        id: 'annotations',
    }, submenu);
}
//# sourceMappingURL=AnnotationMenu.js.map