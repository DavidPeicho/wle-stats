import {Component} from '@wonderlandengine/api';
import {property} from '@wonderlandengine/api/decorators.js';
import {Stats} from './stats.js';

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

    init(): void {
        this._container = document.createElement('div');

        /* Default css */
        this._container.style.position = 'fixed';
        this._container.style.top = '0';
        this._container.style.left = '0';

        this._container.appendChild(this._stats.canvas);
    }

    /** @override */
    onActivate(): void {
        if (this.useDefaultHeader) {
            // @todo
        }
        const parent = this.parentContainer
            ? document.getElementById(this.parentContainer)
            : document.body;
        parent?.append(this._container);
    }

    /** @override */
    onDeactivate(): void {
        this._container.remove();
    }

    /** @override */
    update(dt: number): void {
        this._stats.update(dt);
    }

    get container(): HTMLDivElement {
        return this._container;
    }
}
