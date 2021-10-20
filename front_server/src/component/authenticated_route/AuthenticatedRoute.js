import React from 'react';
import { withRouter, Router } from 'next/router';
import { withCookies, Cookies } from 'react-cookie';
import { instanceOf } from 'prop-types';
// import { connect } from "react-redux";

/**
* 权限验证路由 HOC
* 使用方式：export default authenticatedRoute(MyComponent, { pathAfterFailure: '/login' })
* @param {*} Component 
* @param {{pathAfterFailure: ?string, tokenName: ?string}} options 
*/
const authenticatedRoute = (Component = null, options = {}) => {
    class AuthenticatedRoute extends React.Component {

        static propTypes = {
            // router: instanceOf(Router).isRequired, // router 的类型是 Object 而不是 Router
            cookies: instanceOf(Cookies).isRequired
        };

        state = {
            loading: true,
            code: '',
        };

        checkAuthentication() {
            // console.log('state: %o', this.state);
            let { token } = this.state;
            console.log(`${options.tokenName || 'token'}: %o`, token);
            if (token == undefined) {
                return false;
            } else
                return true;
        }

        constructor(props) {
            super(props);
            const { cookies, router } = props;
            // console.log('Router.query: %o', Router.query)
            // console.log('cookies: %o', cookies);
            // console.log('length: %o', cookies.cookies);
            let token = cookies.get(options.tokenName || 'token');
            console.log('router.asPath: %o', router.asPath)
            // console.log('final token: %o', token);

            // if (!token) {
            //     cookies.set('token', 'xxxyy', { path: '/' })
            // }
            // token = cookies.get('token');
            this.state.token = token;
            this.state.router = router;
            const queryKey = 'code';
            let match = router.asPath.match(new RegExp(`[&?]${queryKey}=(.*?)(&|$)`));
            const queryValue = router.query[queryKey] || match && match[1];
            console.log('queryValue: %o', queryValue)
            this.state.code = queryValue;   // 通过 Reg 获取第一次渲染无法获得的query对象（Nextjs SB）
        }

        componentDidMount() {
            // Cookies.save('token', 'xxxyy', { path: "/" })
            let res = this.checkAuthentication();
            if (res) { //this.props.isLoggedIn
                this.setState({ loading: false });
            } else {
                if (this.state.code)
                    this.state.router.push({ pathname: options.pathAfterFailure || "/login", query: { code: this.state.code } });
                else {
                    alert('未能获取到 code！')
                }
            }
        }

        render() {
            const { loading } = this.state;

            if (loading) {
                return <div />;
            }

            return <Component {...this.props} />;
        }
    }

    // Redux 负责注入props的方式，我使用 cookie 判断，用不到。
    // return connect((state) => ({
    //     isLoggedIn: state?.authenticated && !!state?.user,
    // }))(AuthenticatedRoute);

    return withRouter(withCookies(AuthenticatedRoute));
};

export default authenticatedRoute;