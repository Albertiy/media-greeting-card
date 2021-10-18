import React from 'react'
import { Input } from 'antd'
const { TextArea } = Input;
import styles from './Paragraph.module.scss'
import PropTypes from 'prop-types';

export default function Paragraph(props) {
    const value = props.value;
    const onChange = props.onChange;

    return (
        <TextArea className={styles.paragraph} value={value}
            onChange={onChange || function (e) { console.log(e) }}></TextArea>
    )
}

Paragraph.propTypes = {
    value: PropTypes.string,
    onChange: PropTypes.func,
}