import {Object3D, TextComponent, Texture} from '@wonderlandengine/api';
import {property} from '@wonderlandengine/api/decorators.js';

import {StatsComponentBase} from './stats-base.js';

interface TexturedMaterial {
    diffuseTexture?: Texture | null;
    flatTexture?: Texture | null;
}

/**
 * Rendering mode.
 *
 * This allows to control whether the panel follows the camera or not.
 */
export enum Mode {
    Static = 0,
    Overlay = 1,
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
export class Stats3dComponent extends StatsComponentBase {
    /** @override */
    static TypeName = 'stats-3d';

    static Properties = Object.assign({}, StatsComponentBase.Properties);

    @property.enum(['Texture', 'TextureOverlay'], 0)
    mode: number = 0;

    /**
     * Rate, **in milliseconds**, at which the chart is updated.
     *
     * @note The value will be averaged over this time.
     */
    @property.float(500)
    updateRateMs: number = 500;

    /** Object containing a {@link TextComponent} to update. */
    @property.object()
    text: Object3D | null = null;

    /** Texture to update. @hidden */
    private _texture: Texture | null = null;

    /** Cached reference of the text component. @hidden */
    private _textComp: TextComponent | null = null!;

    /** Cached reference of the material. @hidden */
    private _material: TexturedMaterial | null = null;

    /** @override */
    onActivate(): void {
        const aspect = this._stats.canvas.width / this._stats.canvas.height;

        const mesh = this.object.getComponent('mesh');
        if (!mesh) throw new Error('no mesh component found on object');
        if (!mesh.material) throw new Error('no mesh has no material attached');

        const scale = this.object.getScalingLocal();
        this.object.setScalingLocal([scale[0] * aspect, scale[1], scale[2]]);

        this._texture = new Texture(this._engine, this._stats.canvas);
        this._material = mesh.material as TexturedMaterial;
        this._material.diffuseTexture = this._texture;
        this._material.flatTexture = this._texture;

        this._textComp = this.text?.getComponent(TextComponent) ?? null;

        super.onActivate();
    }

    /** @override */
    onDeactivate(): void {
        this._texture?.destroy();
        if (this._material) {
            this._material.diffuseTexture = null;
            this._material.flatTexture = null;
        }

        super.onDeactivate();
    }

    /** @override */
    update(): void {
        const canvas = this._stats.canvas;
        this._texture!.updateSubImage(0, 0, canvas.width, canvas.height);

        if (this._textComp) this._textComp.text = this._text;
    }
}
