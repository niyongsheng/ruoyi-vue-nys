/* eslint-disable */
/**
 * 第三方库缺失类型声明的兜底
 */

declare module 'vue-cropper' {
  const VueCropper: any;
  export default VueCropper;
}

declare module 'vue-cropper/dist/index.mjs' {
  const VueCropper: any;
  export default VueCropper;
}


declare module 'vuedraggable/dist/vuedraggable.common' {
  const draggable: any;
  export default draggable;
}

declare module 'element-plus/dist/locale/zh-cn.mjs' {
  const zhCn: any;
  export default zhCn;
}
