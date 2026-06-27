import { SvgWrapper } from '../Wrapper.js';
import { CommonMactionMixin, } from '../../common/Wrappers/maction.js';
import { TooltipData } from '../../common/Wrappers/maction.js';
import { MmlMaction } from '../../../core/MmlTree/MmlNodes/maction.js';
import { STATE } from '../../../core/MathItem.js';
export const SvgMaction = (function () {
    var _a;
    const Base = CommonMactionMixin(SvgWrapper);
    return _a = class SvgMaction extends Base {
            setEventHandler(type, handler, dom = null) {
                (dom ? [dom] : this.dom).forEach((node) => node.addEventListener(type, handler));
            }
            Px(m) {
                return this.px(m);
            }
            toSVG(parents) {
                if (this.toEmbellishedSVG(parents))
                    return;
                const svg = this.standardSvgNodes(parents);
                const child = this.selected;
                let i = 0;
                this.dom.forEach((node) => {
                    const { h, d, w } = child.getLineBBox(i++);
                    this.adaptor.append(node, this.svg('rect', {
                        width: this.fixed(w),
                        height: this.fixed(h + d),
                        x: i === 1 ? this.fixed(-this.dx) : 0,
                        y: this.fixed(-d),
                        fill: 'none',
                        'pointer-events': 'all',
                    }));
                });
                child.toSVG(svg);
                const bbox = child.getOuterBBox();
                if (child.dom) {
                    child.place(bbox.L * bbox.rscale, 0);
                }
                this.action(this, this.data);
            }
        },
        _a.kind = MmlMaction.prototype.kind,
        _a.styles = {
            '[jax="SVG"] mjx-tool': {
                display: 'inline-block',
                position: 'relative',
                width: 0,
                height: 0,
            },
            '[jax="SVG"] mjx-tool > mjx-tip': {
                position: 'absolute',
                top: 0,
                left: 0,
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
            'g[data-mml-node="maction"][data-toggle]': {
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
            'g[data-mjx-collapsed]': {
                fill: '#55F',
            },
            '@media (prefers-color-scheme: dark) /* svg maction */': {
                'mjx-tool > mjx-tip': {
                    'background-color': '#303030',
                    color: '#E0E0E0',
                    'box-shadow': '2px 2px 5px #000',
                },
                'mjx-status': {
                    'background-color': '#303030',
                    color: '#E0E0E0',
                },
                'g[data-mjx-collapsed]': {
                    fill: '#88F',
                },
            },
        },
        _a.actions = new Map([
            [
                'toggle',
                [
                    (node, _data) => {
                        node.dom.forEach((dom) => {
                            node.adaptor.setAttribute(dom, 'data-toggle', node.node.attributes.get('selection'));
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
                        for (const dom of node.dom) {
                            const rect = node.firstChild(dom);
                            if (tip.node.isKind('mtext')) {
                                const text = tip.node.getText();
                                node.adaptor.insert(node.svg('title', {}, [node.text(text)]), rect);
                            }
                            else {
                                const adaptor = node.adaptor;
                                const container = node.jax.container;
                                const math = node.node.factory.create('math', {}, [node.childNodes[1].node]);
                                const tool = node.html('mjx-tool', {}, [node.html('mjx-tip')]);
                                const hidden = adaptor.append(rect, node.svg('foreignObject', { style: { display: 'none' } }, [
                                    tool,
                                ]));
                                node.jax.processMath(node.jax.factory.wrap(math), adaptor.firstChild(tool));
                                node.childNodes[1].node.parent = node.node;
                                node.setEventHandler('mouseover', (event) => {
                                    data.stopTimers(dom, data);
                                    data.hoverTimer.set(dom, setTimeout(() => {
                                        adaptor.setStyle(tool, 'left', '0');
                                        adaptor.setStyle(tool, 'top', '0');
                                        adaptor.append(container, tool);
                                        const tbox = adaptor.nodeBBox(tool);
                                        const nbox = adaptor.nodeBBox(dom);
                                        const dx = (nbox.right - tbox.left) / node.metrics.em +
                                            node.tipDx;
                                        const dy = (nbox.bottom - tbox.bottom) / node.metrics.em +
                                            node.tipDy;
                                        adaptor.setStyle(tool, 'left', node.Px(dx));
                                        adaptor.setStyle(tool, 'top', node.Px(dy));
                                    }, data.postDelay));
                                    event.stopPropagation();
                                }, dom);
                                node.setEventHandler('mouseout', (event) => {
                                    data.stopTimers(dom, data);
                                    const timer = setTimeout(() => adaptor.append(hidden, tool), data.clearDelay);
                                    data.clearTimer.set(dom, timer);
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
                            node.dom.forEach((dom) => adaptor.setAttribute(dom, 'data-statusline', text));
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