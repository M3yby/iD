import { event as d3_event } from 'd3-selection';

import { t, localizer } from '../core/localizer';
import { uiTooltip } from './tooltip';
import { svgIcon } from '../svg/icon';

export function uiZoomToSelection(context) {

    function isDisabled() {
        var mode = context.mode();
        return !mode || !mode.zoomToSelected;
    }

    var _lastPointerUpType;

    function pointerup() {
        _lastPointerUpType = d3_event.pointerType;
    }

    function click() {
        d3_event.preventDefault();

        if (isDisabled()) {
            if (_lastPointerUpType === 'touch' || _lastPointerUpType === 'pen') {
                context.ui().flash
                    .duration(2000)
                    .iconName('#iD-icon-framed-dot')
                    .iconClass('disabled')
                    .label(t.html('inspector.zoom_to.no_selection'))();
            }
        } else {
            var mode = context.mode();
            if (mode && mode.zoomToSelected) {
                mode.zoomToSelected();
            }
        }

        _lastPointerUpType = null;
    }

    return function(selection) {

        var tooltipBehavior = uiTooltip()
            .placement((localizer.textDirection() === 'rtl') ? 'right' : 'left')
            .title(function() {
                if (isDisabled()) {
                    return t.html('inspector.zoom_to.no_selection');
                }
                return t.html('inspector.zoom_to.title');
            })
            .keys([t('inspector.zoom_to.key')]);

        var button = selection
            .append('button')
            .on('pointerup', pointerup)
            .on('click', click)
            .call(svgIcon('#iD-icon-framed-dot', 'light'))
            .call(tooltipBehavior);

        function setEnabledState() {
            button.classed('disabled', isDisabled());
            if (!button.select('.tooltip.in').empty()) {
                button.call(tooltipBehavior.updateContent);
            }
        }

        context.on('enter.uiZoomToSelection', setEnabledState);

        setEnabledState();
    };
}
