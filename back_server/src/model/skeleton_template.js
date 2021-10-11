const SkeletonTemplate = [
    {
        name: '默认模板-1',
        /** @type{string} 自定义页面标题，默认空 */
        title: null,
        /** @type{number} 内置背景图片Id，默认1 */
        bgImageId: 1,
        /** @type{number} 自定义背景图片Id */
        customBgImageId: null,
        /** @type{number} 背景音乐，默认空*/
        bgMusicId: null,
        /** @type{number[]} 图片列表，第一张图片为主图 */
        imageList: [],
        /** @type{object[]} 文段列表 */
        textList: [],
        /** @type{string} 自定义字体，默认空 */
        font: null,
    }
];

module.exports = SkeletonTemplate;