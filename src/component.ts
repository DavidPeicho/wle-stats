import {Component} from '@wonderlandengine/api';
import {property} from '@wonderlandengine/api/decorators.js';
import {Stats} from './stats.js';
import {BACKGROUND, MAIN_COLOR} from './colors.js';

/**
 * Create the header enclosing the title and the numeric value.
 *
 * @returns An object containing the header container as well
 *     as the html element containing the text to update.
 */
function createHeader(): {container: HTMLDivElement; text: HTMLElement} {
    const text = document.createElement('p');
    text.style.margin = '0';
    text.style.padding = '6px';
    text.style.fontFamily = 'monospace';
    text.style.fontWeight = 'bold';

    const container = document.createElement('div');
    container.append(text);
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
export class StatsComponent extends Component {
    /** @override */
    static TypeName = 'wle:stats';

    /** HTML id of the parent container. When empty, defaults to `document.body`. */
    @property.string()
    parentContainer: string = '';

    /**
     * If `true`, append a header with a title and the numerical value.
     *
     * Example: "FPS: 60".
     */
    @property.bool(true)
    useDefaultHeader: boolean = true;

    /**
     * Rate, **in milliseconds**, at which the statistics are updated.
     *
     * @note The value will be averaged over this time.
     */
    @property.float(500)
    updateRateMs: number = 500;

    /* Graph properties. */

    @property.float(0)
    minY: number = 0;

    @property.float(120)
    maxY: number = 120;

    /** Stats object. @hidden */
    private _stats: Stats = null!;

    /** Timestamp starting at the last update. @hidden */
    private _startTime: number = 0.0;

    /** Frame count starting at the last update. @hidden */
    private _frame: number = 0;

    /* HTML layout. */

    /** <div> enclosing the stats canvas. @hidden */
    private _container: HTMLDivElement = null!;

    /** <div> enclosing the header. @hidden */
    private _header: HTMLDivElement = null!;

    /** <p> containing the text inside the header. @hidden */
    private _text: HTMLElement = null!;

    /* Pre/Post render hook. */

    /** Triggered after the scene is rendered. @hidden */
    private readonly _onPostRender = this._update.bind(this);

    /** @override */
    init(): void {
        const {container: header, text} = createHeader();
        this._header = header;

        this._text = text;
        this._text.style.color = MAIN_COLOR;

        this._container = document.createElement('div');
        this._container.style.background = BACKGROUND;
        this._container.style.position = 'fixed';
        this._container.style.top = '0';
        this._container.style.left = '0';
    }

    /** @override */
    onActivate(): void {
        if (this.useDefaultHeader) {
            this._container.prepend(this._header);
        }
        const parent = this.parentContainer
            ? document.getElementById(this.parentContainer)
            : document.body;
        parent?.append(this._container);

        this._stats = new Stats({minY: this.minY, maxY: this.maxY});
        this._container.appendChild(this._stats.canvas);

        this._engine.scene.onPostRender.add(this._onPostRender);
    }

    /** @override */
    onDeactivate(): void {
        this._header.remove();
        this._container.remove();

        this._engine.scene.onPostRender.remove(this._onPostRender);
    }

    /** HTML element enclosing the stats canvas. */
    get container(): HTMLDivElement {
        return this._container;
    }

    private _update(): void {
        ++this._frame;

        const now = performance.now();
        const elapsedMs = now - this._startTime;

        if (elapsedMs < this.updateRateMs) return;

        const fps = this._frame / (elapsedMs * 0.001);
        if (this.useDefaultHeader) {
            this._text.innerText = `FPS: ${fps.toFixed(1)}`;
        }
        this._stats.update(fps);
        this._startTime = now;
        this._frame = 0;
    }
}
