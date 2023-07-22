import {CHART_BACKGROUND, MAIN_COLOR} from './colors.js';

/**
 * Color representation.
 *
 * This is used to modify the color in the chart.
 */
export type ColorStyle = string | CanvasGradient | CanvasPattern;

/**
 * Options to setup a {@link Stats} object.
 */
export interface StatsOptions {
    /** Width, in **CSS pixels**, of the graph. */
    width: number;
    /** Height, in **CSS pixels**, of the graph. */
    height: number;
    /** Minimum y-axis value. See {@link Stats.min} for more information. */
    minY: number;
    /** Maximum y-axis value. See {@link Stats.max} for more information. */
    maxY: number;
}

/**
 * Stats graph.
 *
 * ## Usage
 *
 * ```js
 * // Initialization.
 * const stats = new Stats();
 * document.body.append(stats.canvas);
 *
 * // Update the graph with the value `value`.
 * stats.update(value);
 * ```
 *
 * The chart y-axis is scaled using {@link Stats.min} and {@link Stats.max}.
 * For instance, using a **min** value of `0` and a **max** value of `100`
 * means that the value `50` will be plotted at the center of the graph.
 *
 * For more information, have a look at {@link Stats.update}.
 */
export class StatsGraph {
    /** Graph background color. */
    background: ColorStyle = CHART_BACKGROUND;

    /** Graph foreground color, i.e., the column color. */
    main: ColorStyle = MAIN_COLOR;

    /** Width of a column, in **physical pixels**. @hidden */
    private _columnWidth: number = 1;

    /** Inner canvas. @hidden */
    private _canvas: HTMLCanvasElement;

    /** 2d rendering context for graph plot. @hidden */
    private _context: CanvasRenderingContext2D;

    /** Minimum y-axis value. @hidden */
    private _min: number = 0.0;

    /** Maximum y-axis value. @hidden */
    private _max: number = 1.0;

    /** If `true`, the graph needs to be cleared. @hidden */
    private _dirty = true;

    /**
     * Create a new stats instance.
     *
     * @param opts The initial options.
     */
    constructor(opts: Partial<StatsOptions> = {}) {
        this._canvas = document.createElement('canvas');
        const context = this._canvas.getContext('2d');
        if (!context) {
            throw new Error('Stats(): Failed to retrieve 2d context');
        }

        this._context = context;

        const {minY = 0, maxY = 120} = opts;
        this.min = minY;
        this.max = maxY;

        this.setDimensions(100, 40);
    }

    /**
     * Update the plot with a new value.
     *
     * @param value The value to plot.
     */
    update(value: number): void {
        if (this._dirty) this.clear();

        const width = this._canvas.width - this._columnWidth;
        const height = this._canvas.height;

        /* Copy previous content shifted by one column. */
        this._context.drawImage(
            this._canvas,
            this._columnWidth,
            0,
            width,
            height,
            0,
            0,
            width,
            height
        );

        /* Clear the new column */
        this._context.fillStyle = this.background;
        this._context.fillRect(width, 0, this._columnWidth, height);

        /* Append the new value. 2D canvas origin is top-left. */
        this._context.fillStyle = this.main;
        const yScale = (value - this.min) / (this.max - this.min);
        const y = yScale * height;
        this._context.fillRect(width, height - y, this._columnWidth, y);
    }

    /**
     * Clear the plot, i.e., re-draw the background color.
     *
     * @returns Reference to self (for method chaining).
     */
    clear(): this {
        this._context.fillStyle = this.background;
        this._context.fillRect(0, 0, this._canvas.width, this._canvas.height);
        this._dirty = false;
        return this;
    }

    /**
     * Update the graph width & height.
     *
     * @param width The new width, in **CSS pixels**.
     * @param height The new height, in **CSS pixels**.
     *
     * @returns Reference to self (for method chaining).
     */
    setDimensions(width: number, height: number): this {
        this._canvas.width = width * devicePixelRatio;
        this._canvas.height = height * devicePixelRatio;
        this._dirty = true;
        return this;
    }

    needsClear(): this {
        this._dirty = true;
        return this;
    }

    get min(): number {
        return this._min;
    }

    set min(value: number) {
        this._min = value;
        this.needsClear();
    }

    get max(): number {
        return this._max;
    }

    set max(value: number) {
        this._max = value;
        this.needsClear();
    }

    /** Graph canvas. */
    get canvas(): HTMLCanvasElement {
        return this._canvas;
    }
}
