export interface StatsOptions {
    width: number;
}

export type ColorStyle = string | CanvasGradient | CanvasPattern;

export class Stats {
    public background: ColorStyle = '#000000';
    public main: ColorStyle = '#e8008a';

    private _columnWidth: number = 1;

    private _canvas: HTMLCanvasElement;
    private _context: CanvasRenderingContext2D;

    private _dirty: boolean = true;

    constructor() {
        this._canvas = document.createElement('canvas');
        const context = this._canvas.getContext('2d');
        if (!context) {
            throw new Error('Stats(): Failed to retrieve 2d context');
        }

        this._context = context;

        this.setDimensions(100, 40);
        this.clear();
    }

    update(value: number) {
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
        const y = Math.random() * 50;
        this._context.fillRect(width, y, this._columnWidth, height - y);
    }

    clear() {
        this._context.fillStyle = this.background;
        this._context.fillRect(0, 0, this._canvas.width, this._canvas.height);
    }

    setDimensions(width: number, height: number): this {
        this._canvas.width = width * devicePixelRatio;
        this._canvas.height = height * devicePixelRatio;
        return this;
    }

    get canvas(): HTMLCanvasElement {
        return this._canvas;
    }
}
