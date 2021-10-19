import React from 'react'
import styles from './ImageBtn.module.scss'
import PropTypes from 'prop-types';

function ImageBtn(props) {
    const { src, title, onClick, imgStyle, children } = props;

    return (
        <div className={styles.btnContainer}>
            <div className={styles.btnIcon} onClick={onClick}>
                {children ||
                    <img title={title} alt={title} className={styles.btnImg} style={imgStyle} src={src}></img>
                }
            </div>
            <span className={styles.btnText}>{title}</span>
        </div>
    )
}

ImageBtn.propTypes = {
    src: PropTypes.string,
    title: PropTypes.string,
    onClick: PropTypes.func,
    imgStyle: PropTypes.object,
}

export default ImageBtn;