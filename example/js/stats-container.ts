import {Component, WonderlandEngine} from '@wonderlandengine/api';

/**
 * Dummy component to create a shared dom container
 * between all StatsComponent in this project.
 */
export class StatsContainer extends Component {
    /** @overload */
    static TypeName = 'stats-container';

    /** @overload */
    init() {
        const container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.top = '0';
        container.style.left = '0';
        container.id = 'stats-container';
        document.body.append(container);
    }
}
