/**
 * 校验工具
 *
 * RuoYi 原版此处有 12 个校验函数，迁移后只剩 isExternal 仍被使用
 * （components/{ImagePreview,ImageUpload} 判断图片是否为外链，二者是代码生成器
 * 模板产出的 <image-preview>/<image-upload> 标签的落地组件）。其余（validURL /
 * validEmail / validUsername 等）已无引用，需要时用 element-plus 表单规则或自行实现。
 */

/**
 * 判断path是否为外链
 * @param {string} path
 * @returns {Boolean}
 */
export function isExternal(path) {
  return /^(https?:|mailto:|tel:)/.test(path)
}
