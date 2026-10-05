import 'virtual:svg-icons-register';
import 'element-plus/dist/index.css';
import 'element-plus/theme-chalk/dark/css-vars.css';
import 'uno.css';
import '../styles/css/global.css';
// 全局样式（EP 变量桥 + 外壳组件外观；两者都是全局单例，显式引入并保持此顺序）
import '../styles/scss/element-plus.scss';
// RuoYi 契约兼容层（.mb8/生成器契约类/运行时类；必须在 uno.css 之后加载，见文件头索引）
import '../styles/scss/ruoyi-compat.scss';
