/**
 * RuoYi `<svg-icon>` 的兼容入口
 *
 * RuoYi 侧存在 `import SvgIcon from "@/components/SvgIcon"` 的显式导入，
 * 这里转发到 soybean 的 SvgIcon（已支持 iconClass / className / color 别名 props）。
 * 用 .ts 转发而非 .vue，避免与 src/components/custom/svg-icon.vue 在
 * unplugin-vue-components 里重名。
 */
import SvgIcon from '@/components/custom/svg-icon.vue';

export default SvgIcon;
