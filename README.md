# Wonderland Engine Stats

Wonderland Engine stats component.

![Example showing FPS and frame time](https://github.com/DavidPeicho/wle-stats/blob/main/img/example.png)

This library is inspired by [stats.js](https://github.com/mrdoob/stats.js) from mrdoob.

**Features Overview**:

* [HTML graph](#html-Component)
* [3D static graph](#3d-static)
* [3D overlay graph](#3d-overlay)
* [Generic Graph](#generic-graph) (to use outside of Wonderland Engine)

## Usage

You can install the library using `yarn` / `npm`:

```sh
yarn i wle-stats
```

In order to have a quick overview of each features, you can open the [example](./example) using Wonderland Engine.

## Features

### 3D Static

https://github.com/DavidPeicho/wle-stats/assets/8783766/4aa91829-ccdf-41aa-97a9-45b1ac46009f

1. Create an object and add a mesh component
2. Create a material. You can use any shader / pipeline, as long as the material contains
  either a `flatTexture` or a `diffuseTexture` parameter.
3. Add the `stats-3d` component on an object at the desired location.
4. Reference the object containing the mesh on the `stats-3d` component

For more information, please have a look at the [Stats3dComponent](./src/components/stats3d-component.ts).

### 3D Overlay

https://github.com/DavidPeicho/wle-stats/assets/8783766/0bad31cf-9ed5-46ea-acd7-79211e376431

Follow the same step described in the [3D Static](#3d-static) section. Set the `mode` property of the `stats-3d` component to: `Overlay`.

### HTML Component

![HTML stats example](https://github.com/DavidPeicho/wle-stats/blob/main/img/example.png)

Add the `stats-html` component anywhere in your scene. This component will be added in `document.body` by default.

For more information, please have a look at the [StatsHtmlComponent](./src/components/stats-html-component.ts).

### Generic Graph

This library exposes the [StatsGraph](./src/stats.ts) class, usable outside of the Wonderland Engine ecosystem.

```js
import {StatsGraph} from 'wle-stats';

const stats = new StatsGraph({
    minY: 0,
    maxY: 120,
    width: 100,
    height: 40
});
```

Add the graph canvas in the dom using:

```js
document.body.append(stats.canvas);
```

Adding a value is done using `update(value)`:

```js
// Draws '50.0' on the chart.
stats.update(50.0);
```

For more information, please have a look at the public interface of the
[StatsGraph](./src/stats.ts) class.

## Future

WonderlandEngine doesn't expose (yet) its profiler. In the future, this library will take advatange of the internal profiler to display fine-grained numbers.
