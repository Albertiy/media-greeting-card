import { mdiMusic, mdiMusicOff } from '@mdi/js';
import { Icon } from '@mdi/react';
import styles from './background_music.module.css';
import PropTypes from 'prop-types';
import { useEffect, useRef } from 'react';

function BackgroundMusic(props) {
    const musicOn = props.musicOn;
    const onClick = props.onClick;
    const source = props.source;
    const audioEle = useRef(null);

    useEffect(() => {
        // console.log(source)
        if (audioEle.current) {
            // TODO 也许不使用 <audio> 而是使用 AudioContext 播放声音
            /** @type{HTMLAudioElement} */
            let audio = audioEle.current;
            // console.log('[audio]: %O', audio)
            // && audio.src
            if (musicOn) audio.play();
            else audio.pause();
        }
    }, [musicOn])

    return (
        <div className={[styles.music_btn, musicOn ? styles.music_on_btn : undefined].join(" ")} onClick={onClick}>
            <Icon path={musicOn ? mdiMusic : mdiMusicOff} size={0.85}></Icon>
            {/* autoPlay={true} */}
            <audio controls={false} loop ref={audioEle} src={source}>
                {/* <source src={source}></source> */}
            </audio>
        </div>
    );
}

BackgroundMusic.propTypes = {
    musicOn: PropTypes.bool,
    source: PropTypes.string,
    onClick: PropTypes.func,
}

export default BackgroundMusic;