import React from 'react'
import { Input } from 'antd'
const { TextArea } = Input;
import styles from './Paragraph.module.scss'
import PropTypes from 'prop-types';

export default function Paragraph(props) {
    const value = props.value;
    const onChange = props.onChange;
    const readOnly = props.readOnly;

    return (
        <TextArea className={[styles.paragraph, readOnly ? styles.readonly : null].join(' ')} value={value}
            onChange={onChange || function (e) { console.log(e) }} {...props}></TextArea>
    )
}

Paragraph.propTypes = {
    value: PropTypes.string,
    onChange: PropTypes.func,
    readOnly: PropTypes.bool,
}