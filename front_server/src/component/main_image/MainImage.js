import React from 'react'
import styles from './MainImage.module.scss'
import PropTypes from 'prop-types'

export default function MainImage(props) {
    return (
        <div className={styles.mainImageBorder} onClick={props.onClick || function (e) { console.log('点击了mainImage') }}>
            {
                props.src ? (
                    <img src={props.src || ''} ></img>
                ) : <span>点击上传照片</span>
            }
        </div >
    )
}

MainImage.propTypes = {
    onClick: PropTypes.func,
    src: PropTypes.string,
}