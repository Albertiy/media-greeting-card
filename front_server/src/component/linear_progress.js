import PropTypes from 'prop-types';

/** // TODO: 懒得写。material ui 组件先用着吧。
 */
function LinearProgress(props) {
    
}

LinearProgress.PropTypes = {
    variant: PropTypes.oneOf('indeterminate', 'determinate', 'buffer'),
    value: PropTypes.number.isRequired,
    valueBuffer: variant != 'buffer' ? PropTypes.number : PropTypes.number.isRequired,
}