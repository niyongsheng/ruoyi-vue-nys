import { ElCard, ElForm, ElTableColumn } from 'element-plus';

/**
 * Element Plus 组件全局默认值
 *
 * 注意：Element Plus 2.14 起移除了「改写组件 props 定义」的写法
 * （旧写法 `ElCard.props.shadow = { type: String, default: 'never' }` 会报
 *  "Property 'props' does not exist"），改为官方提供的 `setPropsDefaults()`，
 * 传入的是**默认值本身**而不是 prop 定义对象。
 *
 * @see node_modules/element-plus/es/utils/vue/typescript.d.ts 的 setPropsDefaults 声明
 */

/**
 * 全局表格列居中（RuoYi 页面大量使用 el-table，统一居中）
 *
 * 注意这里用的是独立导出的 `ElTableColumn` 而不是 `ElTable.TableColumn`：
 * 2.14 的 `withInstall(main, extra)` 只给 main 挂 `setPropsDefaults`，extra 上的
 * 子组件（`ElTable.TableColumn`）运行时/类型上都没有；独立的 `ElTableColumn`
 * 走 `withNoopInstall()` 才有。两者指向同一个组件对象，改哪个都生效。
 */
ElTableColumn.setPropsDefaults({ align: 'center' });

/** 全局 ElCard 去掉阴影（soybean 的卡片是扁平风格） */
ElCard.setPropsDefaults({ shadow: 'never' });

/** 全局 ElForm 必填星号放在右侧（RuoYi 表单习惯） */
ElForm.setPropsDefaults({ requireAsteriskPosition: 'right' });
