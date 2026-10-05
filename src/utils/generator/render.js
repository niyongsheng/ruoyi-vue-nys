import { defineComponent, h } from 'vue'
import {
  ElButton,
  ElCascader,
  ElCheckbox,
  ElCheckboxButton,
  ElCheckboxGroup,
  ElColorPicker,
  ElDatePicker,
  ElIcon,
  ElInput,
  ElInputNumber,
  ElOption,
  ElRadio,
  ElRadioGroup,
  ElRate,
  ElSelect,
  ElSlider,
  ElSwitch,
  ElTimePicker,
  ElUpload
} from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { makeMap } from '@/utils/index'

/**
 * 表单构建画布用字符串 tag（如 'el-input'）动态渲染组件
 *
 * 这里显式映射组件而不是依赖 app.component 全局注册：全局注册会把整套组件
 * 打进首屏入口 chunk，而这些组件只服务表单构建页（tool/build 已是懒加载路由）。
 */
const epComponents = {
  'el-button': ElButton,
  'el-cascader': ElCascader,
  'el-checkbox': ElCheckbox,
  'el-checkbox-button': ElCheckboxButton,
  'el-checkbox-group': ElCheckboxGroup,
  'el-color-picker': ElColorPicker,
  'el-date-picker': ElDatePicker,
  'el-icon': ElIcon,
  'el-input': ElInput,
  'el-input-number': ElInputNumber,
  'el-option': ElOption,
  'el-radio': ElRadio,
  'el-radio-group': ElRadioGroup,
  'el-rate': ElRate,
  'el-select': ElSelect,
  'el-slider': ElSlider,
  'el-switch': ElSwitch,
  'el-time-picker': ElTimePicker,
  'el-upload': ElUpload,
  Plus
}

function resolveEpComponent(tag) {
  return epComponents[tag] ?? resolveComponent(tag)
}

const isAttr = makeMap(
  'accept,accept-charset,accesskey,action,align,alt,async,autocomplete,' +
  'autofocus,autoplay,autosave,bgcolor,border,buffered,challenge,charset,' +
  'checked,cite,class,code,codebase,color,cols,colspan,content,http-equiv,' +
  'name,contenteditable,contextmenu,controls,coords,data,datetime,default,' +
  'defer,dir,dirname,disabled,download,draggable,dropzone,enctype,method,for,' +
  'form,formaction,headers,height,hidden,high,href,hreflang,http-equiv,' +
  'icon,id,ismap,itemprop,keytype,kind,label,lang,language,list,loop,low,' +
  'manifest,max,maxlength,media,method,GET,POST,min,multiple,email,file,' +
  'muted,name,novalidate,open,optimum,pattern,ping,placeholder,poster,' +
  'preload,radiogroup,readonly,rel,required,reversed,rows,rowspan,sandbox,' +
  'scope,scoped,seamless,selected,shape,size,type,text,password,sizes,span,' +
  'spellcheck,src,srcdoc,srclang,srcset,start,step,style,summary,tabindex,' +
  'target,title,type,usemap,value,width,wrap' + 'prefix-icon'
)
const isNotProps = makeMap(
  'layout,prepend,regList,tag,document,changeTag,defaultValue'
)

const componentChild = {
  'el-button': {
    default(h, conf, key) {
      return conf[key]
    },
  },
  'el-select': {
    options(h, conf, key) {
      return conf.options.map(item => h(ElOption, {
        label: item.label,
        value: item.value,
      }))
    }
  },
  'el-radio-group': {
    options(h, conf, key) {
      return conf.optionType === 'button' ? conf.options.map(item => h(ElCheckboxButton, {
        label: item.value,
      }, () => item.label)) : conf.options.map(item => h(ElRadio, {
        label: item.value,
        border: conf.border,
      }, () => item.label))
    }
  },
  'el-checkbox-group': {
    options(h, conf, key) {
      return conf.optionType === 'button' ? conf.options.map(item => h(ElCheckboxButton, {
        label: item.value,
      }, () => item.label)) : conf.options.map(item => h(ElCheckbox, {
        label: item.value,
        border: conf.border,
      }, () => item.label))
    }
  },
  'el-upload': {
    'list-type': (h, conf, key) => {
      const option = {}
      // if (conf.showTip) {
      //   tip = h('div', {
      //     class: "el-upload__tip"
      //   }, () => '只能上传不超过' + conf.fileSize + conf.sizeUnit + '的' + conf.accept + '文件')
      // }
      if (conf['list-type'] === 'picture-card') {
        return h(ElIcon, option, () => h(Plus))
      } else {
        // option.size = "small"
        option.type = "primary"
        option.icon = "Upload"
        return h(ElButton, option, () => conf.buttonText)
      }
    },

  }
}
const componentSlot = {
  'el-upload': {
    'tip': (h, conf, key) => {
      if (conf.showTip) {
        return () => h('div', {
          class: "el-upload__tip"
        }, '只能上传不超过' + conf.fileSize + conf.sizeUnit + '的' + conf.accept + '文件')
      }
    },
  }
}
export default defineComponent({

  // 使用 render 函数
  render() {
    const dataObject = {
      attrs: {},
      props: {},
      on: {},
      style: {}
    }
    const confClone = JSON.parse(JSON.stringify(this.conf))
    const children = []
    const slot = {}
    const childObjs = componentChild[confClone.tag]
    if (childObjs) {
      Object.keys(childObjs).forEach(key => {
        const childFunc = childObjs[key]
        if (confClone[key]) {
          children.push(childFunc(h, confClone, key))
        }
      })
    }
    const slotObjs = componentSlot[confClone.tag]
    if (slotObjs) {
      Object.keys(slotObjs).forEach(key => {
        const childFunc = slotObjs[key]
        if (confClone[key]) {
          slot[key] = childFunc(h, confClone, key)
        }
      })
    }
    Object.keys(confClone).forEach(key => {
      const val = confClone[key]
      if (dataObject[key]) {
        dataObject[key] = val
      } else if (isAttr(key)) {
        dataObject.attrs[key] = val
      } else if (!isNotProps(key)) {
        dataObject.props[key] = val
      }
    })
    if(children.length > 0){
      slot.default = () => children
    }
    
    return h(resolveEpComponent(this.conf.tag),
      {
        modelValue: this.$attrs.modelValue,
        ...dataObject.props,
        ...dataObject.attrs,
        style: {
          ...dataObject.style
        },
      }
      , slot ?? null)
  },
  props: {
    conf: {
      type: Object,
      required: true,
    },
  }
})