import {Component} from '@wonderlandengine/api';
import {property} from '@wonderlandengine/api/decorators.js';
import {Stats} from './stats.js';
import {BACKGROUND, MAIN_COLOR} from './colors.js';

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
 * @todo
 */
export class StatsComponent extends Component {
    static TypeName = 'wle:stats';

    @property.string()
    parentContainer: string = '';

    @property.bool(true)
    useDefaultHeader: boolean = true;

    /** Stats object. @hidden */
    private _stats: Stats = new Stats();

    /** <div> enclosing the stats canvas. @hidden */
    private _container!: HTMLDivElement;
    private _header!: HTMLDivElement;
    private _text!: HTMLElement;

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

        this._container.appendChild(this._stats.canvas);
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
    }

    /** @override */
    onDeactivate(): void {
        this._header.remove();
        this._container.remove();
    }

    /** @override */
    update(dt: number): void {
        const fps = (Math.random() * 20 + 40) >> 0;
        if (this.useDefaultHeader) {
            this._text.innerText = `FPS: ${fps.toFixed(1)}`;
        }
        this._stats.update(fps);
    }

    get container(): HTMLDivElement {
        return this._container;
    }
}
