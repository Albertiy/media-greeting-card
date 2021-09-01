import PropTypes from 'prop-types'
import styles from './label_input.module.css'

/**
 * 
 * @param {{label:string}} props 
 * @returns 
 */
function LabelInput(props) {
    const { children, className = '', style = {}, label, ...other } = props
    return (
        <div className={[styles.border, className].join(' ')} style={style} {...other}>
            <label>{label}</label>{children}
        </div>
    )
}

LabelInput.propTypes = {
    label: PropTypes.string,
}

export default LabelInput;