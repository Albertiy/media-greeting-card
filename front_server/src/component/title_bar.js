import PropTypes from 'prop-types';
import styles from './title_bar.module.scss';

function TitleBar(props) {
    const { title } = props;
    return (<div className={styles.panel}>
        {title}
    </div>)
}

TitleBar.prototype = {
    title: PropTypes.string.isRequired,
}

export default TitleBar;