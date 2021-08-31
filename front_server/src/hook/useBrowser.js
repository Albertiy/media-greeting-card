import { useState, useEffect } from "react";

/**
 * TODO: 获取浏览器信息的HOOK。目前没打算用。
 * @returns 
 */
const useBrowser = () => {
    const [isScreenSmall, setIsScreenSmall] = useState(false);

    let checkScreenSize = () => {
        setIsScreenSmall(window.innerWidth < 600);
    };
    useEffect(() => {
        checkScreenSize();
        window.addEventListener("resize", checkScreenSize);

        return () => window.removeEventListener("resize", checkScreenSize);
    }, []);

    return isScreenSmall;
};

export default useBrowser;
