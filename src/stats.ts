import {CHART_BACKGROUND, MAIN_COLOR} from './colors.js';

export interface StatsOptions {
    width: number;
    minY: number;
    maxY: number;
}

export type ColorStyle = string | CanvasGradient | CanvasPattern;

/**
 * Stats graph.
 *
 * ## Usage
 *
 * ```js
 * const stats = new Stats();
 * ```
 */
export class Stats {
    public background: ColorStyle = CHART_BACKGROUND;
    public main: ColorStyle = MAIN_COLOR;

    private _columnWidth: number = 1;

    private _canvas: HTMLCanvasElement;
    private _context: CanvasRenderingContext2D;

    private _max: number;
    private _min: number;

    private _dirty = true;

    constructor(opts: Partial<StatsOptions> = {}) {
        this._canvas = document.createElement('canvas');
        const context = this._canvas.getContext('2d');
        if (!context) {
            throw new Error('Stats(): Failed to retrieve 2d context');
        }

        this._context = context;

        const {minY = 0, maxY = 120} = opts;
        this._min = minY;
        this._max = maxY;

        this.setDimensions(100, 40);
        this.clear();
    }

    update(value: number) {
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
        const yScale = (value - this._min) / (this._max - this._min);
        const y = yScale * height;
        this._context.fillRect(width, height - y, this._columnWidth, y);
    }

    clear() {
        this._context.fillStyle = this.background;
        this._context.fillRect(0, 0, this._canvas.width, this._canvas.height);
        this._dirty = false;
    }

    setMeasurements(): this {
        return this;
    }

    setDimensions(width: number, height: number): this {
        this._canvas.width = width * devicePixelRatio;
        this._canvas.height = height * devicePixelRatio;
        return this;
    }

    /** Graph canvas. */
    get canvas(): HTMLCanvasElement {
        return this._canvas;
    }
}
