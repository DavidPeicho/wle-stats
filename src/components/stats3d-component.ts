import {
    Object3D,
    MeshComponent,
    TextComponent,
    ViewComponent,
    Texture,
} from '@wonderlandengine/api';
import {property} from '@wonderlandengine/api/decorators.js';

import {StatsComponentBase} from './stats-base.js';
import {quat, vec3} from 'gl-matrix';

/** Typed material for phong and flat materials. */
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
    /** Display the graph on the mesh, without modifying the mesh position / rotation. */
    Static = 0,
    /** Follow the camera, either the main one, or the left eye in VR. */
    Overlay = 1,
}

/* Constants */

/** Default multiplier for position lerping. */
const POSITION_SPEED = 5.0;
/** Default multiplier for rotation lerping. */
const ROTATION_SPEED = 2.0;

/* Temporaries */

const _pointA = vec3.create();
const _pointB = vec3.create();
const _quatA = quat.create();
const _quatB = quat.create();

/**
 * Statistics 3D component.
 *
 * At the opposite of {@link StatsComponent}, this component will render the
 * graph in the 3D scene. The graph is uploaded as a texture and attached
 * to the {@link Stats3dComponent.mesh} material.
 */
export class Stats3dComponent extends StatsComponentBase {
    /** @override */
    static TypeName = 'stats-3d';

    /** @override */
    static Properties = Object.assign({}, StatsComponentBase.Properties);

    /**
     * If this is set to {@linl Mode.Static}, the object position
     * will not be updated.
     *
     * If it's set to {@linl Mode.Overlay}, the component will follow
     * the left eye.
     */
    @property.enum(['Static', 'Overlay'], 0)
    mode: number = 0;

    /** Object containing a {@link MeshComponent} to update. */
    @property.object()
    mesh: Object3D | null = null;

    /** Object containing a {@link TextComponent} to update. */
    @property.object()
    text: Object3D | null = null;

    /**
     * Graph width, in CSS pixels. Higher values will lead to sharper visual results.
     *
     * @note The graph is uploaded as a texture in the texture atlas. Thus, using large
     * values can lead to poor performance as well as preventing to upload other textures.
     */
    @property.int(200)
    width: number = 200;

    /**
     * Graph height, in CSS pixels. Higher values will lead to sharper visual results.
     *
     * @note The graph is uploaded as a texture in the texture atlas. Thus, using large
     * values can lead to poor performance as well as preventing to upload other textures.
     */
    @property.int(150)
    height: number = 150;

    /**
     * Distance at which the panel will be placed.
     *
     * @note Affects the component only when using {@link Mode.Overlay}.
     */
    @property.float(5.0)
    distance: number = 5.0;

    /**
     * Speed at which the panel will move when turning the camera.
     *
     * @note Affects the component only when using {@link Mode.Overlay}.
     */
    @property.float(1.0)
    positionSpeed: number = 1.0;

    /**
     * Speed at which the panel will rotate when turning the camera, until aligned.
     *
     * @note Affects the component only when using {@link Mode.Overlay}.
     */
    @property.float(1.0)
    rotationSpeed: number = 1.0;

    /** Texture to update. @hidden */
    private _texture: Texture | null = null;

    /** Cached reference of the text component. @hidden */
    private _textComp: TextComponent | null = null!;

    /** Cached reference of the material. @hidden */
    private _material: TexturedMaterial | null = null;

    /** Cached views. @hidden */
    private _views: ViewComponent[] = [];

    /** @override */
    onActivate(): void {
        this._stats.setDimensions(this.width, this.height);
        const aspect = this._stats.canvas.width / this._stats.canvas.height;

        const meshObject = this.mesh ?? this.object;
        const mesh = meshObject.getComponent('mesh');
        if (!mesh) throw new Error('no mesh component found on object');
        if (!mesh.material) throw new Error('no mesh has no material attached');

        const scale = meshObject.getScalingLocal();
        meshObject.setScalingLocal([scale[0] * aspect, scale[1], scale[2]]);

        this._texture = new Texture(this.engine, this._stats.canvas);
        this._material = mesh.material as TexturedMaterial;
        this._material.diffuseTexture = this._texture;
        this._material.flatTexture = this._texture;

        this._textComp = this.text?.getComponent(TextComponent) ?? null;

        this._views = this.engine.scene.activeViews;

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
    update(dt: number): void {
        /* Update the object's position and orientation. */
        if (this.mode === Mode.Overlay) this._followTarget(dt);

        /* Update the panel's content. */
        const canvas = this._stats.canvas;
        this._texture!.updateSubImage(0, 0, canvas.width, canvas.height);
        if (this._textComp) this._textComp.text = this._text;
    }

    /**
     * Make the panel follow the camera.
     *
     * @param dt Delta time.
     *
     * @hidden
     */
    private _followTarget(dt: number): void {
        const vrDisabled = this.engine.xr === null || this._views.length < 2;
        const camera = (vrDisabled ? this._views[0] : this._views[1]).object;

        // @todo: Offset to bottom left corner.

        /* Lerp current and target positions using the distance property. */

        const posLerp = dt * POSITION_SPEED * Math.max(this.positionSpeed, 0.0001);
        camera.getForwardWorld(_pointA);
        vec3.scale(_pointA, _pointA, this.distance);
        const targetPos = camera.getPositionWorld(_pointB);
        vec3.add(targetPos, targetPos, _pointA);

        const pos = this.object.getPositionWorld(_pointA);
        vec3.lerp(pos, pos, targetPos, posLerp);
        this.object.setPositionWorld(pos);

        /* Lerp current and target rotations. */

        const rotLerp = dt * ROTATION_SPEED * Math.max(this.rotationSpeed, 0.0001);
        const targetRot = camera.getRotationWorld(_quatA);
        const rot = this.object.getRotationWorld(_quatB);
        quat.lerp(rot, rot, targetRot, rotLerp);
        this.object.setRotationWorld(rot);
    }
}
