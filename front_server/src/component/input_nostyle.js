import { useEffect, useRef } from 'react';
import styles from './input_nostyle.module.css'
import PropTypes from 'prop-types'

/**
 * 无样式输入框组件
 * @param {{defaultValue:string, placeholder:string, onChange:(target:HTMLInputElement)=>{})}} props 
 * @returns 
 */
function NoStyleInput(props) {
    const { className, defaultValue = '', placeholder = '', onChange = () => { }, parentRef, ...other } = props;
    const ele = useRef(null);
    useEffect(() => {
        setValue(defaultValue);
        parentRef.current = setValue;
    }, []);

    /**
     * 提供给父组件调用以直接设置值
     * @param {*} value 
     */
    function setValue(value) {
        // console.log(value);
        if (value && ele.current) {
            ele.current.value = value;
        }
    }

    return (<input ref={ele} className={[styles.input, className].join(' ')} placeholder={placeholder} onChange={(event) => { onChange(event.target) }} {...other}></input>)
}

NoStyleInput.propTypes = {
    defaultValue: PropTypes.string,
    placeholder: PropTypes.string,
    onchange: PropTypes.func,
    parentRef: PropTypes.any,
}

export default NoStyleInput;