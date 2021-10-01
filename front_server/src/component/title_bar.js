import PropTypes from 'prop-types';
import styles from './title_bar.module.scss';

function TitleBar(props) {
    const { title, leftEle, rightEle } = props;
    return (<div className={styles.panel}>
        <span className={styles.left}>{leftEle}</span>
        <span className={styles.title}>{title}</span>
        <span className={styles.right}>{rightEle}</span>
    </div>)
}

TitleBar.propTypes = {
    title: PropTypes.string.isRequired,
    leftEle: PropTypes.element,
    rightEle: PropTypes.element
}

export default TitleBar;