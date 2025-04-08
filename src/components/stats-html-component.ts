import {property} from '@wonderlandengine/api/decorators.js';

import {BACKGROUND, MAIN_COLOR} from '../colors.js';
import {StatsComponentBase} from './stats-base.js';

/**
 * Create the header enclosing the title and the numeric value.
 *
 * @returns The html element.
 */
function createHeader(): HTMLElement {
    const text = document.createElement('p');
    text.style.margin = '0';
    text.style.padding = '6px';
    text.style.fontFamily = 'monospace';
    text.style.fontWeight = 'bold';
    text.style.color = MAIN_COLOR;

    return text;
}

/**
 * Create the dom container enclosing the header
 * as well as the chart canvas.
 *
 * @param canvas The canva to append.
 * @returns the html element.
 */
function template(canvas: HTMLCanvasElement) {
    const text = createHeader();

    const container = document.createElement('div');
    container.style.background = BACKGROUND;
    container.style.margin = '4px';

    container.appendChild(text);
    container.appendChild(canvas);

    return {container, text};
}

/**
 * Statistics component.
 *
 * This component will hook a container with a canvas containing
 * a graph with a FPS metric.
 *
 * ## Usage
 *
 * This component can be added anywhere in your scene, like a regular
 * Wonderland Engine component.
 */
export class StatsHtmlComponent extends StatsComponentBase {
    /** @override */
    static TypeName = 'stats-html';

    /** @override */
    static Properties = Object.assign({}, StatsComponentBase.Properties);

    /**
     * HTML id of the parent container. When empty,
     * defaults to `document.body`.
     *
     * If no parent is provided, the element will by default
     * use `position: fixed` to be visible on top of everything.
     */
    @property.string()
    parentContainer: string = '';

    /* HTML layout. */

    /** <div> enclosing the stats canvas. @hidden */
    private _container: HTMLDivElement = null!;

    /** <p> containing the text inside the header. @hidden */
    private _textElement: HTMLElement = null!;

    /** @hidden */
    constructor() {
        // @ts-ignore
        super(...arguments);

        const {container, text} = template(this.stats.canvas);
        this._container = container;
        this._textElement = text;
    }

    /** @override */
    onActivate(): void {
        const parent = this.parentContainer
            ? document.getElementById(this.parentContainer)
            : null;
        if (!parent) {
            /* If no parent is provided, fallback to the upper
             * left corner, above everything. */
            this._container.style.position = 'fixed';
            this._container.style.top = '0';
            this._container.style.left = '0';
            this._container.style.zIndex = '1000';
        }
        (parent ?? document.body).append(this._container);

        super.onActivate();
    }

    /** @override */
    onDeactivate(): void {
        this._container.remove();
        super.onDeactivate();
    }

    update(): void {
        this._textElement.innerHTML = this._text;
    }

    /** Column color. Defaults to Wonderland Engine purple. */
    @property.string(MAIN_COLOR)
    set color(value: string) {
        // @todo: Fix workaround due to how Wonderland Engine setup defaults.
        if (!this._textElement || !this.stats) return;

        this._textElement.style.color = value;
        this.stats.main = value;
        this.stats.needsClear();
    }
}
