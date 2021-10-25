import React from 'react'
import styles from './MainImage.module.scss'
import PropTypes from 'prop-types'

function MainImage(props) {
    return (
        <div className={styles.mainImageBorder} onClick={props.onClick || function (e) { console.log('点击了mainImage') }}>
            {
                props.src ? (
                    <img style={{ maxWidth: '100%', maxHeight: '100%' }} src={props.src || ''} ></img>
                ) : <span className={styles.text}> {props.textOnEmpty || '无图像'} </span>
            }
        </div >
    )
}

MainImage.propTypes = {
    onClick: PropTypes.func,
    src: PropTypes.string,
    textOnEmpty: PropTypes.string,
}

export default MainImage;