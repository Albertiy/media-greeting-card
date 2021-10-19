import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";

const useCode = () => {
    const router = useRouter();
    const routerRefreshCount = useRef(0);
    const [routerLoaded, setRouterLoaded] = useState(false);
    const [code, setCode] = useState(null);

    useEffect(() => {
        console.log('第' + (routerRefreshCount.current + 1) + '次路由刷新')
        let params = router.query;
        console.log('params: %o', params)
        if (params && params.code) {
            let code = params.code;
            setCode(code);
        }
        if (routerRefreshCount.current > 0) { setRouterLoaded(true); console.log('路由参数已加载') }
        routerRefreshCount.current += 1;
    }, [router.query])

    return { code, routerRefreshCount, routerLoaded };
}

export default useCode;