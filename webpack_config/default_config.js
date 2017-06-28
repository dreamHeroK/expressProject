/* 
 * ---------------------------------------osapp模块配置对象文件---------------------------------------
 * 
 * 模块文件夹深度 = 对象深度
 * 
 * 参数 entry:    js文件夹下的 js文件 name 数组
 *      html:     当前文件夹下 
 *       - name:  html 文件 name
 *       - chunk: 需要引入的js对应的 entry 元素
 *
 * 注： 必须按照*标准文件架构* 搭建模块目录
 *        
 *              css/[name].css
 *              js/[name].js
 *              [name].html
 * 
 * 特例：如需要在某个模块引入其他模块 js到entry
 *
 *              entry name中添加路径
 *
 *              如：'/backstage_mgmt/doctor/js/doctor'
 *              (backstage_mgmt | user | doctorManage 模块)
 */

module.exports = {
    test: {
        entry: ['index'],
        html: [{
            name: 'index',
            chunk: ['index']
        }]
    }
}