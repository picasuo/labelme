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
    <div class="info">
      <p class="info__item">✓ - 已支持格式</p>
      <p class="info__item">☐ - 暂时不支持</p>
      <p class="info__item">✗ - 格式对于给定的标签类型没有意义</p>
    </div>

    <sx-header title="数据集格式规范" />

    <sx-header title="COCO" level="secondary" />

    <ul>
      <li class="format" v-for="(item, index) in cocoData" :key="index">
        <header class="format__header">{{ item.keyName }}</header>
        <p class="format__describe">
          {{ item.describe }}
        </p>

        <el-descriptions
          class="descriptions"
          v-if="item.more"
          title=""
          direction="vertical"
          :column="3"
          border
        >
          <el-descriptions-item
            v-for="el in item.more"
            :key="el.value"
            :label="el.key"
            >{{ el.value }}</el-descriptions-item
          >
        </el-descriptions>
      </li>
    </ul>

    <sx-header title="YOLO" level="secondary" />

    <ul>
      <li class="format" v-for="(item, index) in yoloData" :key="index">
        <header class="format__header">{{ item.keyName }}</header>
        <p class="format__describe">
          {{ item.describe }}
        </p>

        <!-- <el-descriptions
          v-if="item.more"
          title="垂直带边框列表"
          direction="vertical"
          :column="4"
          border
        >
          <el-descriptions-item
            v-for="el in item.more"
            :key="el.value"
            :label="el.key"
            >{{ el.value }}</el-descriptions-item
          >
        </el-descriptions> -->
      </li>
    </ul>
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
      keyboard: '⌘ + z 或者 ctrl + z',
    },
    {
      info: '重做',
      area: '工具栏 + 图片标注区',
      keyboard: '⌘ + shift + z 或者 ctrl + shift + z',
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

  cocoData = [
    {
      keyName: 'info',
      describe:
        'json文件字段，包含多个image实例的数组，每个image实例包含id、width、height、file_name，分别表示图片id、图片宽、高、图片名称。',
    },
    {
      keyName: 'images',
      describe:
        'json文件字段，包含多个image实例的数组，每个image实例包含id、width、height、file_name，分别表示图片id、图片宽、高、图片名称。',
    },
    {
      keyName: 'annotations',
      describe:
        'json文件字段，包含多个注解框实例的数组，每个框实例包含id、iscrowd、image_id、catefroy_id、segmentation、bbox、area这些属性。',
      more: [
        {
          key: 'id',
          value: '表示该实例id',
        },
        {
          key: 'iscrowd',
          value: '用于区分该注解框属于多边形还是矩形，0表示多边形，1表示矩形',
        },
        {
          key: 'image_id',
          value: '表示该框对应的类别id',
        },
        {
          key: 'segmentation',
          value: '表示多边形框所有锚点的坐标相对于原图原点的距离的集合',
        },
        {
          key: 'bbox',
          value: '存储了矩形框相对于原图原点的位置坐标以及宽高',
        },
        {
          key: 'area',
          value: '表示多边形框在原图中所占的面积',
        },
      ] as any,
    },
    {
      keyName: 'categories',
      describe:
        'json文件字段，包含所有注解标签实例的数组。每个标签实例都包含id、name两个属性。',
    },
  ] as any

  yoloData = [
    {
      keyName: 'data.yaml',
      describe: '包含标签名称数组',
      more: [],
    },
    {
      keyName: 'xxx.txt',
      describe:
        '包含在labels文件夹中，以图片名称命名的txt文件，包含该图片所有注解框的信息',
      more: [],
    },
    {
      keyName: 'xxx.jpg/jpeg/png',
      describe: '包含在images文件夹中，图片格式',
      more: [],
    },
  ]
}
</script>

<style lang="scss" scoped>
.sui-header {
  padding-left: 0;
}
.sui-header-title {
  color: #fff;
  font-size: 18px;
}
.explanation {
  background-color: rgba(0, 0, 0, 1);
  //   display: flex;
  padding: 20px 40px;
  position: absolute;
  left: get-vw(60px);
  right: 0;
  //   top: 0;
  //   bottom: 0;
  z-index: 1;
  //   z-index: 999999;

  //   width: 100vw;
  height: 100%;
  color: #fff;
  font-size: 14px;
  overflow-y: scroll;

  //   &__main {
  //     width: get-vw(688px);
  //   }
}
.info {
  &__item {
    margin: 20px;
    margin-left: 0;
  }
}

.format {
  padding: 0 20px 10px 0;
  &__header {
    font-size: 18px;
  }

  &__describe {
    padding: 5px 0 0 0;
  }
}

.descriptions {
  margin: 20px;
  margin-left: 0;
}

/deep/.el-descriptions__table {
  width: 100%;
  height: 200px;
}
</style>
