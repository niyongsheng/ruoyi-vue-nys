<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { listUser } from '@/api/system/user';
import { listRole } from '@/api/system/role';
import { listMenu } from '@/api/system/menu';
import { listDept } from '@/api/system/dept';
import { $t } from '@/locales';

defineOptions({ name: 'CardData' });

interface CardData {
  key: string;
  title: string;
  value: number;
  unit: string;
  color: {
    start: string;
    end: string;
  };
  icon: string;
}

/** 系统规模统计（取后端真实数据） */
const counts = reactive({
  user: 0,
  role: 0,
  menu: 0,
  dept: 0
});

const cardData = computed<CardData[]>(() => [
  {
    key: 'userCount',
    title: $t('page.home.userCount'),
    value: counts.user,
    unit: '',
    color: {
      start: '#ec4786',
      end: '#b955a4'
    },
    icon: 'ant-design:user-outlined'
  },
  {
    key: 'roleCount',
    title: $t('page.home.roleCount'),
    value: counts.role,
    unit: '',
    color: {
      start: '#865ec0',
      end: '#5144b4'
    },
    icon: 'ant-design:team-outlined'
  },
  {
    key: 'menuCount',
    title: $t('page.home.menuCount'),
    value: counts.menu,
    unit: '',
    color: {
      start: '#56cdf3',
      end: '#719de3'
    },
    icon: 'ant-design:menu-outlined'
  },
  {
    key: 'deptCount',
    title: $t('page.home.deptCount'),
    value: counts.dept,
    unit: '',
    color: {
      start: '#fcbc25',
      end: '#f68057'
    },
    icon: 'ant-design:apartment-outlined'
  }
]);

function getGradientColor(color: CardData['color']) {
  return `linear-gradient(to bottom right, ${color.start}, ${color.end})`;
}

/** 拉取统计（分页接口只取 total；列表接口取 length）；单个接口失败不影响其他卡片 */
async function loadCounts() {
  const pageQuery = { pageNum: 1, pageSize: 1 };

  const [userRes, roleRes, menuRes, deptRes] = await Promise.all([
    listUser(pageQuery).catch(() => null),
    listRole(pageQuery).catch(() => null),
    listMenu({}).catch(() => null),
    listDept({}).catch(() => null)
  ]);

  counts.user = (userRes as any)?.total ?? 0;
  counts.role = (roleRes as any)?.total ?? 0;
  counts.menu = Array.isArray((menuRes as any)?.data) ? (menuRes as any).data.length : 0;
  counts.dept = Array.isArray((deptRes as any)?.data) ? (deptRes as any).data.length : 0;
}

onMounted(loadCounts);

// ---------------- ChromaGrid 交互（参考 vue-bits 的 ChromaGrid） ----------------
// 效果：鼠标附近把彩色卡片「去色」（backdrop-filter grayscale + 径向遮罩），
// 阻尼跟随用 @property + CSS transition 实现（原版用 gsap，这里不引入依赖）。

const rootRef = ref<HTMLElement>();

/** 容器级：把鼠标在网格内的坐标写入 CSS 变量 */
function handleMove(e: PointerEvent) {
  const el = rootRef.value;
  if (!el) return;

  const rect = el.getBoundingClientRect();
  el.style.setProperty('--x', `${e.clientX - rect.left}px`);
  el.style.setProperty('--y', `${e.clientY - rect.top}px`);
}

/** 卡片级：把鼠标在卡片内的坐标写入 CSS 变量（用于卡片内高光） */
function handleCardMove(e: MouseEvent) {
  const card = e.currentTarget as HTMLElement;
  const rect = card.getBoundingClientRect();
  card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
  card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
}
</script>

<template>
  <ElCard class="card-wrapper">
    <div ref="rootRef" class="chroma-grid" @pointermove="handleMove">
      <ElRow :gutter="16">
        <ElCol v-for="item in cardData" :key="item.key" :lg="6" :md="12" :sm="24" class="my-8px">
          <div
            class="chroma-card rd-8px px-16px pb-4px pt-8px text-white"
            :style="{ backgroundImage: getGradientColor(item.color) }"
            @mousemove="handleCardMove"
          >
            <h3 class="text-16px">{{ item.title }}</h3>
            <div class="flex justify-between pt-12px">
              <SvgIcon :icon="item.icon" class="text-32px" />
              <CountTo
                :prefix="item.unit"
                :start-value="0"
                :end-value="item.value"
                class="text-30px text-white font-600"
              />
            </div>
          </div>
        </ElCol>
      </ElRow>

      <!-- 色彩抽取聚光层：鼠标附近去色 -->
      <div class="chroma-spotlight" />
    </div>
  </ElCard>
</template>

<!--
  @property 需在顶层声明（不能放进 scoped 块），用于让 --x/--y 可被 transition 插值。
  这是替代 gsap 阻尼跟随的关键：JS 只负责写值，缓动交给 CSS。
-->
<style>
@property --x {
  syntax: '<length>';
  inherits: true;
  initial-value: 0px;
}

@property --y {
  syntax: '<length>';
  inherits: true;
  initial-value: 0px;
}

@property --mouse-x {
  syntax: '<length>';
  inherits: true;
  initial-value: 0px;
}

@property --mouse-y {
  syntax: '<length>';
  inherits: true;
  initial-value: 0px;
}
</style>

<style scoped>
.chroma-grid {
  position: relative;
  --r: 300px;
  /* --x/--y 由 JS 写入（@property 声明为 <length>，初始 0px；
     进入前 opacity:0，所以初始位置不可见） */
  /* 阻尼跟随（原版 gsap 的 duration 0.45 + power3.out ≈ easeOutQuint） */
  transition:
    --x 0.45s cubic-bezier(0.22, 1, 0.36, 1),
    --y 0.45s cubic-bezier(0.22, 1, 0.36, 1);
}

.chroma-card {
  position: relative;
  overflow: hidden;
  cursor: default;
}

/* 卡片内跟随鼠标的高光 */
.chroma-card::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 1;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.5s;
  background: radial-gradient(circle at var(--mouse-x) var(--mouse-y), rgb(255 255 255 / 0.35), transparent 70%);
}

.chroma-card:hover::after {
  opacity: 1;
}

/* 色彩抽取层：遮罩是「中间透明、向外渐显」，配合 grayscale 形成鼠标附近的去色圈 */
.chroma-spotlight {
  position: absolute;
  inset: 0;
  z-index: 2;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.35s;
  backdrop-filter: grayscale(1) brightness(0.92);
  -webkit-backdrop-filter: grayscale(1) brightness(0.92);
  background: rgb(0 0 0 / 0.001); /* 触发 backdrop-filter 生效 */
  mask-image: radial-gradient(
    circle var(--r) at var(--x) var(--y),
    transparent 0%,
    transparent 45%,
    rgb(0 0 0 / 0.35) 65%,
    rgb(0 0 0 / 0.7) 85%,
    #fff 100%
  );
  -webkit-mask-image: radial-gradient(
    circle var(--r) at var(--x) var(--y),
    transparent 0%,
    transparent 45%,
    rgb(0 0 0 / 0.35) 65%,
    rgb(0 0 0 / 0.7) 85%,
    #fff 100%
  );
}

.chroma-grid:hover .chroma-spotlight {
  opacity: 1;
}
</style>
