/**
 * 菜单图标选择器的图标列表
 *
 * 图标已随迁移放到 src/assets/svg-icon/（与 soybean 的图标目录一致），
 * 因此这里 glob 新路径（原 RuoYi 为 assets/icons/svg/）。
 */
let icons = []

const modules = import.meta.glob('./../../assets/svg-icon/*.svg')

for (const path in modules) {
  const name = path.split('assets/svg-icon/')[1].split('.svg')[0]
  icons.push(name)
}

icons.sort()

export default icons
