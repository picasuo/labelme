<template>
  <div class="explanation">
    <sx-header title="简介" />
    <p>
      sx-label-me是一款在线照片标注工具，可以用做训练视觉深度算法的工具。支持导入图，对图片进行分类、对象标注；也可以导入数据集，实现标注数据的可视化。该应用基于Vue@2.0，采用TypeScript编写，同时引入fabric.js操作canvas对象。
    </p>

    <sx-header title="键盘快捷键" />
    <sx-table :columns="column1" :data="data1" />
    <sx-header title="目前支持的导出格式" />
    <sx-table :columns="column2" :data="data2" />
    <p>✓ - 已支持格式</p>
    <p>☐ - 暂时不支持</p>
    <p>✗ - 格式对于给定的标签类型没有意义</p>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'

@Component({
  components: {},
})
export default class SxExplanation extends Vue {
  column1 = [
    {
      title: '功能描述',
      align: 'cenetr',
      key: 'info',
    },
    {
      title: '作用区域',
      align: 'cenetr',
      key: 'area',
    },
    {
      title: '按键(MAC)',
      align: 'cenetr',
      key: 'keyboard',
    },
  ]

  data1 = [
    {
      info: '切换图片',
      area: '图片管理',
      keyboard: 'Up、Down、Left、Right',
    },
    {
      info: '绑定标签',
      area: '标签管理 + 图片标注区',
      keyboard: '1...9',
    },
    {
      info: '切换到拖拽工具',
      area: '工具栏 + 图片标注区',
      keyboard: 's',
    },
    {
      info: '切换到套索工具',
      area: '工具栏 + 图片标注区',
      keyboard: 'p',
    },
    {
      info: '切换到矩形工具',
      area: '工具栏 + 图片标注区',
      keyboard: 'r',
    },
    {
      info: '清除本图注解',
      area: '工具栏 + 图片标注区',
      keyboard: 'n',
    },
    {
      info: '重复上次框选',
      area: '工具栏 + 图片标注区',
      keyboard: 'c',
    },
    {
      info: '撤销',
      area: '工具栏 + 图片标注区',
      keyboard: '⌘ + z',
    },
    {
      info: '重做',
      area: '工具栏 + 图片标注区',
      keyboard: '⌘ + shift + z',
    },
    {
      info: '删除选中对象',
      area: '图片标注区',
      keyboard: 'backspace',
    },
    {
      info: '缩放',
      area: '工具栏 + 图片标注区',
      keyboard: '触摸板手势 双指',
    },
  ]

  column2 = [
    {
      title: '',
      align: 'center',
      key: 'type',
    },
    {
      title: 'CSV',
      align: 'center',
      key: 'CSV',
    },
    {
      title: 'YOLO',
      align: 'center',
      key: 'YOLO',
    },
    {
      title: 'VOC XML',
      align: 'center',
      key: 'VOC',
    },
    {
      title: 'VGG JSON',
      align: 'center',
      key: 'VGG',
    },
    {
      title: 'COCO JSON',
      align: 'center',
      key: 'COCO',
    },
    {
      title: 'PIXEL MASK',
      align: 'center',
      key: 'PIXEL',
    },
  ]

  data2 = [
    {
      type: '图片分类',
      CSV: '✗',
      YOLO: '✗',
      VOC: '☐',
      VGG: '☐',
      COCO: '✓',
      PIXEL: '✗',
    },
    {
      type: '图片分类',
      CSV: '✗',
      YOLO: '✗',
      VOC: '☐',
      VGG: '☐',
      COCO: '✓',
      PIXEL: '✗',
    },
    {
      type: '图片分类',
      CSV: '✗',
      YOLO: '✗',
      VOC: '☐',
      VGG: '☐',
      COCO: '✓',
      PIXEL: '✗',
    },
  ]
}
</script>

<style lang="scss" scoped>
.sui-header-title {
  color: #fff;
  font-size: 22px;
}
.explanation {
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  padding: 20px;
  position: absolute;
  //   left: 0;
  //   right: 0;
  //   top: 0;
  //   bottom: 0;
  z-index: 1;
  flex-direction: column;
  width: 100vw;
  height: 100vh;
  color: #fff;
  font-size: 16px;
  overflow-y: scroll;

  //   &__main {
  //     width: get-vw(688px);
  //   }
}
</style>
