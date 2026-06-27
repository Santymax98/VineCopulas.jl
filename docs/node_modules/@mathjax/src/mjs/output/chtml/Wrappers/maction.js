import { ChtmlWrapper } from '../Wrapper.js';
import { CommonMactionMixin, } from '../../common/Wrappers/maction.js';
import { MmlMaction } from '../../../core/MmlTree/MmlNodes/maction.js';
import { TooltipData } from '../../common/Wrappers/maction.js';
import { STATE } from '../../../core/MathItem.js';
export const ChtmlMaction = (function () {
    var _a;
    const Base = CommonMactionMixin(ChtmlWrapper);
    return _a = class ChtmlMaction extends Base {
            setEventHandler(type, handler, dom = null) {
                (dom ? [dom] : this.dom).forEach((node) => node.addEventListener(type, handler));
            }
            Em(m) {
                return this.em(m);
            }
            toCHTML(parents) {
                if (this.toEmbellishedCHTML(parents))
                    return;
                const chtml = this.standardChtmlNodes(parents);
                const child = this.selected;
                child.toCHTML(chtml);
                this.action(this, this.data);
            }
        },
        _a.kind = MmlMaction.prototype.kind,
        _a.styles = {
            'mjx-maction': {
                position: 'relative',
            },
            'mjx-maction > mjx-tool': {
                display: 'none',
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: 0,
                height: 0,
                'z-index': 500,
            },
            'mjx-tool > mjx-tip': {
                display: 'inline-block',
                'line-height': 0,
                padding: '.2em',
                border: '1px solid #888',
                'background-color': '#F8F8F8',
                color: 'black',
                'box-shadow': '2px 2px 5px #AAAAAA',
            },
            'mjx-maction[toggle]': {
                cursor: 'pointer',
            },
            'mjx-status': {
                display: 'block',
                position: 'fixed',
                left: '1em',
                bottom: '1em',
                'min-width': '25%',
                padding: '.2em .4em',
                border: '1px solid #888',
                'font-size': '90%',
                'background-color': '#F8F8F8',
                color: 'black',
            },
            'mjx-container [data-mjx-collapsed]': {
                color: '#55F',
            },
            '@media (prefers-color-scheme: dark) /* chtml maction */': {
                'mjx-tool > mjx-tip': {
                    border: '1px solid #888',
                    'background-color': '#303030',
                    color: '#E0E0E0',
                    'box-shadow': '2px 2px 5px #000',
                },
                'mjx-status': {
                    'background-color': '#303030',
                    color: '#E0E0E0',
                },
                'mjx-container [data-mjx-collapsed]': {
                    color: '#88F',
                },
            },
        },
        _a.actions = new Map([
            [
                'toggle',
                [
                    (node, _data) => {
                        node.dom.forEach((dom) => {
                            node.adaptor.setAttribute(dom, 'toggle', node.node.attributes.get('selection'));
                        });
                        const math = node.factory.jax.math;
                        const document = node.factory.jax.document;
                        const mml = node.node;
                        node.setEventHandler('click', (event) => {
                            if (!math.end.node) {
                                math.start.node = math.end.node = math.typesetRoot;
                                math.start.n = math.end.n = 0;
                            }
                            mml.nextToggleSelection();
                            math.rerender(document, mml.attributes.get('data-maction-id')
                                ? STATE.ENRICHED
                                : STATE.RERENDER);
                            event.stopPropagation();
                        });
                    },
                    {},
                ],
            ],
            [
                'tooltip',
                [
                    (node, data) => {
                        const tip = node.childNodes[1];
                        if (!tip)
                            return;
                        if (tip.node.isKind('mtext')) {
                            const text = tip.node.getText();
                            node.dom.forEach((dom) => node.adaptor.setAttribute(dom, 'title', text));
                        }
                        else {
                            const adaptor = node.adaptor;
                            for (const dom of node.dom) {
                                const tool = adaptor.append(dom, node.html('mjx-tool', {
                                    style: {
                                        bottom: node.Em(-node.tipDy),
                                        right: node.Em(-node.tipDx),
                                    },
                                }, [node.html('mjx-tip')]));
                                tip.toCHTML([adaptor.firstChild(tool)]);
                                node.setEventHandler('mouseover', (event) => {
                                    data.stopTimers(dom, data);
                                    const timeout = setTimeout(() => adaptor.setStyle(tool, 'display', 'block'), data.postDelay);
                                    data.hoverTimer.set(dom, timeout);
                                    event.stopPropagation();
                                }, dom);
                                node.setEventHandler('mouseout', (event) => {
                                    data.stopTimers(dom, data);
                                    const timeout = setTimeout(() => adaptor.setStyle(tool, 'display', ''), data.clearDelay);
                                    data.clearTimer.set(dom, timeout);
                                    event.stopPropagation();
                                }, dom);
                            }
                        }
                    },
                    TooltipData,
                ],
            ],
            [
                'statusline',
                [
                    (node, data) => {
                        const tip = node.childNodes[1];
                        if (!tip)
                            return;
                        if (tip.node.isKind('mtext')) {
                            const adaptor = node.adaptor;
                            const text = tip.node.getText();
                            node.dom.forEach((dom) => adaptor.setAttribute(dom, 'statusline', text));
                            node.setEventHandler('mouseover', (event) => {
                                if (data.status === null) {
                                    const body = adaptor.body(adaptor.document);
                                    data.status = adaptor.append(body, node.html('mjx-status', {}, [node.text(text)]));
                                }
                                event.stopPropagation();
                            });
                            node.setEventHandler('mouseout', (event) => {
                                if (data.status) {
                                    adaptor.remove(data.status);
                                    data.status = null;
                                }
                                event.stopPropagation();
                            });
                        }
                    },
                    {
                        status: null,
                    },
                ],
            ],
        ]),
        _a;
})();
//# sourceMappingURL=maction.js.map