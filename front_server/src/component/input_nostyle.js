import { useEffect, useRef } from 'react';
import styles from './input_nostyle.module.css'
import PropTypes from 'prop-types'

/**
 * 无样式输入框组件
 * @param {{defaultValue:string, placeholder:string, onChange:(target:HTMLInputElement)=>{})}} props 
 * @returns 
 */
function NoStyleInput(props) {
    const { className, defaultValue = '', placeholder = '', onChange = () => { }, ...other } = props;
    const ele = useRef(null);
    useEffect(() => {
        if (ele.current) {
            ele.current.value = defaultValue;
        }
    }, []);
    return (<input ref={ele} className={[styles.input, className].join(' ')} placeholder={placeholder} onChange={(event) => { onChange(event.target) }} {...other}></input>)
}

NoStyleInput.propTypes = {
    defaultValue: PropTypes.string,
    placeholder: PropTypes.string,
    onchange: PropTypes.func,
}

export default NoStyleInput;