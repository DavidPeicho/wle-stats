import {Component, WonderlandEngine} from '@wonderlandengine/api';
import {property} from '@wonderlandengine/api/decorators.js';

/**
 * stats-container
 */
export class StatsContainer extends Component {
    static TypeName = 'stats-container';

    init() {
        const container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.top = '0';
        container.style.left = '0';
        container.id = 'stats-container';
        document.body.append(container);
    }
}
