<p align="center">
	<img alt="logo" src="./src/assets/logo/logo.svg">
</p>
<h1 align="center" style="margin: 30px 0 30px; font-weight: bold;">RuoYi VUE NYS</h1>
<h4 align="center">Frontend admin framework adapted to RuoYi backend API</h4>
<p align="center">
	<a href="https://gitee.com/y_project/RuoYi-Vue"><img src="https://img.shields.io/badge/RuoYi-v3.9.2-brightgreen.svg"></a>
	<a href="https://gitee.com/y_project/RuoYi-Vue/blob/master/LICENSE"><img src="https://img.shields.io/github/license/mashape/apistatus.svg"></a>
</p>

[![爱发电](https://img.shields.io/badge/爱发电-Afdian-946ce6?style=for-the-badge&logo=github&logoColor=white)](https://ifdian.net/a/nico2026)
---

## 简介

> [RuoYi（若依）](https://ruoyi.vip) 是国内最受欢迎的开源后台管理框架之一：权限体系完善、代码简洁开箱即用、文档与社区成熟。  
官方前端 `RuoYi-Vue` 的观感稍显陈旧。**本项目适配若依后端 API，结合更现代的前端框架** —— 支持暗黑模式、主题定制、多种布局、中英双语、响应式适配，且若依原有的页面、指令与全局方法均可直接使用，业务代码零改动。

#### 后端仓库
| GitHub | Gitee |
| --- | --- |
| [RuoYi-Vue-fast](https://github.com/yangzongzhuan/RuoYi-Vue-fast)（单模块版，推荐） | [-]() |
| [RuoYi-Vue](https://github.com/yangzongzhuan/RuoYi-Vue) | [RuoYi-Vue](https://gitee.com/y_project/RuoYi-Vue) |

## 技术栈

- Vue 3.5 + Vite + TypeScript
- Element Plus 2.14 + UnoCSS
- Pinia + vue-router
- vue-i18n / ECharts

## 开发

```bash
pnpm install
pnpm dev           # 开发（默认 9527 端口，接口代理到 http://localhost:8080）
pnpm typecheck     # 类型检查
pnpm lint          # 代码检查

pnpm build:prod    # 构建（生产，接口前缀 /prod-api）→ dist/
pnpm build:stage   # 构建（预发布，接口前缀 /stage-api）→ dist/
```

## 效果图

<table>
    <tr>
        <td><img src="https://github.com/user-attachments/assets/119c3432-d4b3-420a-a432-5c0d4e0e01b1"/></td>
        <td><img src="https://github.com/user-attachments/assets/58f9a40c-6bd4-40f0-8758-63f7a9fbb2cb"/></td>
    </tr>
    <tr>
        <td><img src="https://github.com/user-attachments/assets/4b117356-d689-4e84-834f-7f0556f3080c"/></td>
        <td><img src="https://github.com/user-attachments/assets/29864034-2a9b-473d-a2c4-a82ad0eb70cf"/></td>
    </tr>
    <tr>
        <td><img src="https://github.com/user-attachments/assets/98319d79-0cf7-4b74-927a-75ae9dddc193"/></td>
        <td><img src="https://github.com/user-attachments/assets/566ec2f4-3aec-4c5d-b1ae-3a88089f2143"/></td>
    </tr>
    <tr>
        <td><img src="https://github.com/user-attachments/assets/5b87ad8f-fb05-4ebe-97df-598c06524a30"/></td>
        <td><img src="https://github.com/user-attachments/assets/56e212cc-1049-49cc-9457-0e4ea52796f7"/></td>
    </tr>
</table>

## 联系我
* E-mail: niyongsheng@Outlook.com
* Weibo: [@Ni永胜](https://weibo.com/u/7317805089)
