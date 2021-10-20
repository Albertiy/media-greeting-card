import { useState, useEffect } from "react";
import { useCookies, Cookies } from "react-cookie";

const useAccessToken = () => {
    const [cookies, setCookie, removeCookie] = useCookies();
    const [token, setToken] = useState(null)

    useEffect(() => {
        let value = cookies['access_token'];
        // console.log('access_token: %o', value)
        setToken(value)
    }, [cookies])
    return token;
}

export default useAccessToken;