import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';

function EntryPage() {

    const router = useRouter();
    const [code, setCode] = useState(null);

    const routerRefreshCount = useRef(0);

    useEffect(() => {
        console.log('第' + (routerRefreshCount.current + 1) + '次路由刷新')
        let params = router.query;
        console.log(params)
        if (params && params.code) {
            let code = params.code;
            alert('code: ' + code)
            setCode(code);
        }
        return () => {
            routerRefreshCount.current += 1;
        }
    }, [router.query])

    return <div>EntryPoint</div>;
}

export default EntryPage;