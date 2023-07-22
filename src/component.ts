import {Component} from '@wonderlandengine/api';
import {property} from '@wonderlandengine/api/decorators.js';

import {BACKGROUND, MAIN_COLOR} from './colors.js';
import {StatsGraph} from './stats.js';

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
 * Stats type.
 *
 * To use with the {@link StatsComponent} component.
 */
export enum StatsType {
    /** Renders FPS. */
    Fps = 0,
    /** Renders frame time, **in milliseconds**. */
    Milliseconds = 1,
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
export class StatsComponent extends Component {
    /** @override */
    static TypeName = 'stats';

    /** Stats type. */
    @property.enum(['fps', 'milliseconds'], 0)
    statsType: number = 0;

    /**
     * HTML id of the parent container. When empty,
     * defaults to `document.body`.
     */
    @property.string()
    parentContainer: string = '';

    /**
     * Rate, **in milliseconds**, at which the chart is updated.
     *
     * @note The value will be averaged over this time.
     */
    @property.float(500)
    updateRateMs: number = 500;

    /** Stats object. @hidden */
    private _stats: StatsGraph = new StatsGraph();

    /** Timestamp starting at the last update. @hidden */
    private _startTime: number = 0.0;

    /** Frame count starting at the last update. @hidden */
    private _frame: number = 0;

    /* HTML layout. */

    /** <div> enclosing the stats canvas. @hidden */
    private _container: HTMLDivElement = null!;

    /** <p> containing the text inside the header. @hidden */
    private _text: HTMLElement = null!;

    /* Pre/Post render hook. */

    /** Triggered after the scene is rendered. @hidden */
    private readonly _onPostRender = this._update.bind(this);

    /** @hidden */
    constructor() {
        // @ts-ignore
        super(...arguments);

        const {container, text} = template(this._stats.canvas);
        this._container = container;
        this._text = text;
    }

    /** @override */
    onActivate(): void {
        const parent = this.parentContainer
            ? document.getElementById(this.parentContainer)
            : document.body;

        parent?.append(this._container);

        this.reset();
        this._engine.scene.onPostRender.add(this._onPostRender);
    }

    /** @override */
    onDeactivate(): void {
        this._container.remove();
        this._engine.scene.onPostRender.remove(this._onPostRender);
    }

    reset(): this {
        this._startTime = performance.now();
        this._frame = 0;
        return this;
    }

    @property.float(0)
    set minY(value: number) {
        // @todo: Fix workaround due to how Wonderland Engine setup defaults.
        if (this._stats) this._stats.min = value;
    }

    @property.float(120)
    set maxY(value: number) {
        // @todo: Fix workaround due to how Wonderland Engine setup defaults.
        if (this._stats) this._stats.max = value;
    }

    /** Column color. Defaults to Wonderland Engine purple. */
    @property.string(MAIN_COLOR)
    set color(value: string) {
        // @todo: Fix workaround due to how Wonderland Engine setup defaults.
        if (!this._text || !this._stats) return;

        this._text.style.color = value;
        this._stats.main = value;
        this._stats.needsClear();
    }

    /** HTML element enclosing the stats canvas. */
    get dom(): StatsGraph {
        return this._stats;
    }

    private _update(): void {
        ++this._frame;

        const elapsedMs = performance.now() - this._startTime;
        if (elapsedMs < this.updateRateMs) return;

        let value = 0.0;
        let text: string = null!;
        switch (this.statsType) {
            case StatsType.Fps:
                value = this._frame / (elapsedMs * 0.001);
                text = `FPS: ${value.toFixed(1)}`;
                break;
            case StatsType.Milliseconds:
                value = elapsedMs / this._frame;
                text = `${value.toFixed(1)} milliseconds`;
                break;
            default:
                throw new Error(
                    `StatsComponent.update(): Unknown statsType ${this.statsType}`
                );
        }
        this._text.innerHTML = text;
        this._stats.update(value);
        this.reset();
    }
}
