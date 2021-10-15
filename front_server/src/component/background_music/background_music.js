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
        <div className={styles.container}>
            <div className={[styles.music_btn, musicOn ? styles.music_on_btn : undefined].join(" ")} onClick={onClick}>
                <Icon path={musicOn ? mdiMusic : mdiMusicOff} size={0.85}></Icon>
                {/* autoPlay={true} */}
                <audio controls={false} loop ref={audioEle} src={source}>
                    {/* <source src={source}></source> */}
                </audio>
            </div>
            <div className={styles.effect} style={{ filter: "url(#gooey)" }}>
                <div className={styles.moon}></div>
                <span className={[styles.satellite_ball, styles.ball_1, musicOn ? styles.satellite_ball_on : undefined].join(" ")} style={{ zIndex: 1, animationDuration: "2s", }}></span>
                <span className={[styles.satellite_ball, styles.ball_2, musicOn ? styles.satellite_ball_on : undefined].join(" ")} style={{ zIndex: 1, animationDuration: "30s", }}></span>
                <svg className={styles.effect_svg}>
                    <filter id="gooey">
                        {/* <!-- 高斯模糊，由整个图像创建效果，模糊程度为10 --> */}
                        <feGaussianBlur in="SourceGraphic" stdDeviation="1" />
                        {/* <!-- 色彩矩阵，R|G|B|A|常亮偏移 * R|G|B|A --> */}
                        <feColorMatrix values="
                            1 0 0 0 0
                            0 1 0 0 0
                            0 0 1 0 0
                            0 0 0 20 -10
                            " />
                    </filter>
                </svg>
            </div>
        </div >
    );
}

BackgroundMusic.propTypes = {
    musicOn: PropTypes.bool,
    source: PropTypes.string,
    onClick: PropTypes.func,
}

export default BackgroundMusic;