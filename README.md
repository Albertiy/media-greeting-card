# media-greeting-card

## 功能介绍

1. 批量二维码生成，供印刷在贺卡上后扫码上传音视频，接收方扫码看视频。
2. （制作中）定制化图文页面。

## 技术

### 框架

前后端分离。

前端：基于 Reactjs 的 Nextjs 框架，非 SPA。

后端：Nodejs Express，不使用模板引擎，只提供http请求接口，提供数据库服务与文件服务。

基于 sample-expresentation 进一步磨合精简的项目架构。

感觉nodejs还是太繁琐了，出现细小的错误难以排查，需要大量的自我约束来统一。

### 技术细节

* 基于 Web-RTC 的录制功能，（也许）实现了在多平台浏览器上表现的一致性。后台使用 **ffmpeg** 统一转码，视频为 **.mp4（ALC(H264)+mp4a）** 格式，音频为 **.m4a（mp4a）** 格式，在 **/Win/ios/Android** 端浏览器上完美播放(**IE除外**)。需要后端服务器上安装ffmpeg并配置路径。
* mysql数据库必须是8.0以上版本，需要支持`JSON`格式和`JSON`相关函数，以及更多函数默认值写法。
