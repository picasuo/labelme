<template>
  <div class="export">
    <div class="export__main">
      <div class="header">
        <span>导入数据集</span>
      </div>
      <div class="box">
        <div class="sidebar">
          <div
            class="tab"
            v-for="(item, index) in tabs"
            :class="checkedTab === index ? 'tab-active' : ''"
            :key="index"
            @click="changeTab(index, item)"
          >
            {{ item }}
          </div>
        </div>
        <div class="check">
          <i-radio-group
            v-if="!checked"
            v-model="checked"
            vertical
            @on-change="checkInputStatus"
          >
            <i-radio
              v-for="(item, index) in importRadio"
              :key="index"
              :label="item.label"
              >{{ item.name }}</i-radio
            >
          </i-radio-group>
          <p class="innerbox" v-if="checked && checked !== 'RectYOLO'">
            <span>点击此处上传文件</span>
            <input
              class="input-class"
              v-if="checked"
              ref="cocoImport"
              type="file"
              :multiple="isMultiple"
              :accept="fileFormat"
              @change="importFile('cocoImport')"
              :webkitdirectory="isDirectory"
            />
          </p>

          <div class="innerbox" v-if="checked && checked === 'RectYOLO'">
            <p class="innerbox__item">
              <span>上传yaml文件</span>
              <sx-icon v-if="isYamlLoaded" type="icon-wancheng" />
              <input
                v-if="checked"
                class="input-class"
                ref="yamlImport"
                type="file"
                :multiple="true"
                accept="application/x-yaml"
                @change="importFile('yamlImport')"
              />
            </p>
            <p class="innerbox__item">
              <span>上传txt文件</span>
              <sx-icon v-if="isTxtLoaded" type="icon-wancheng" />
              <input
                v-if="checked"
                class="input-class"
                ref="txtImport"
                type="file"
                :multiple="true"
                accept="text/plain"
                @change="importFile('txtImport')"
              />
            </p>
          </div>
        </div>
      </div>
      <div class="btn">
        <span :class="isActive ? 'active' : ''" @click="importData">确定</span>
        <span class="cancel" @click="cancel">取消</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { Radio, RadioGroup } from 'iview'
import { loadCocoFile } from 'utils/COCOImporter'
import { loadYamlFile, loadTxtFile, loadYoloFile } from 'utils/YOLOImporter'

@Component({
  components: {
    iRadioGroup: RadioGroup,
    iRadio: Radio,
  },
})
export default class SxImport extends Vue {
  // 0-分类 1-对象
  @Prop({
    type: Number,
  })
  type: number

  @Prop({
    type: Array,
  })
  imagesData: Array<any>

  @Prop({
    type: Boolean,
    default: false,
  })
  isYamlLoaded: boolean

  @Prop({
    type: Boolean,
    default: false,
  })
  isTxtLoaded: boolean

  tabName = '' as any
  checked = null as any
  checkedTab = 0
  isMultiple = false
  isDirectory = false
  fileFormat = ''
  //   isYamlLoaded = false
  //   isTxtLoaded = false

  isActive = false

  get tabs() {
    let arr = [] as any
    switch (this.type) {
      case 0:
        arr = ['图片分类']
        break
      case 1:
        arr = ['全部导入', '矩形', '多边形']
        break
    }
    return arr
  }

  get importRadio() {
    let arr = [] as any
    switch (this.tabName) {
      case '图片分类':
        arr = [{ name: 'Json', label: 'ImgJson' }]
        break
      case '全部导入':
        arr = [{ name: 'COCOJson', label: 'COCO' }]
        break
      case '矩形':
        arr = [{ name: 'YOLO', label: 'RectYOLO' }]
        break
      case '多边形':
        arr = []
        break
    }
    return arr
  }

  mounted() {
    this.changeTab(0, this.tabs[0])
  }

  checkInputStatus(val) {
    if (val === 'COCO' || val === 'ImgJson') {
      this.fileFormat = 'application/json'
      this.isMultiple = false
      this.isDirectory = false
    } else if (val === 'RectYOLO') {
      this.fileFormat = 'text/plain,application/x-yaml'
      //   this.fileFormat = 'file'
      this.isMultiple = true
      this.isDirectory = false
    }
  }

  changeTab(type, item) {
    this.tabName = item
    this.checkedTab = type
    this.checked = null
  }

  importData() {
    if (this.isActive) {
      this.$emit('importData')
      this.isActive = false
    } else {
      return
    }
  }

  cancel() {
    this.isActive = false
    this.$emit('cancelImport')
  }

  importFile(refString) {
    const fileList = this!.$refs![refString]!['files'] as any
    if (this.checked === 'COCO' || this.checked === 'ImgJson') {
      loadCocoFile(fileList[0], this.type).then(val => {
        this.$emit('setAnnotation', val)
        this.isActive = true
      })
    }
    if (refString === 'yamlImport') {
      loadYamlFile(fileList[0]).then(val => {
        this.$emit('setAnnotation', val)
        this.$emit('uploadStatus', { isYamlLoaded: true })

        this.isActive = true
      })
    }
    if (refString === 'txtImport') {
      loadTxtFile(fileList).then(val => {
        this.$emit('setAnnotation', val)
        this.$emit('uploadStatus', { isTxtLoaded: true })
        // this.isTxtLoaded = true
        this.isActive = true
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.export {
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 1;

  &__main {
    width: get-vw(688px);
  }
}

.header {
  border-radius: 5px;
  border: 2px solid #ffffff;
  margin-bottom: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  height: get-vh(50px);
  > span {
    font-size: 18px;
    font-family: PingFangSC-Regular, PingFang SC;
    font-weight: 400;
    color: #ffffff;
    line-height: 22px;
    letter-spacing: 2px;
  }
}

.box {
  height: get-vh(400px);
  margin-bottom: 20px;
  display: flex;
  border-radius: 5px;
  border: 2px solid #ffffff;
  .sidebar {
    height: 100%;
    width: 20%;
    border-right: 2px solid rgba(255, 255, 255, 0.7);
    display: flex;
    flex-direction: column;
    align-items: center;
    .tab {
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      border: 1px solid rgba(255, 255, 255, 0.1);
      width: 100%;
      height: 50px;
      font-size: 16px;
      font-family: PingFangSC-Regular, PingFang SC;
      font-weight: 400;
      color: #ffffff;
      line-height: 22px;
      letter-spacing: 2px;
      &-active {
        border-color: rgba(255, 255, 255, 1);
        background: #424242;
      }
    }
  }
  .check {
    height: 100%;
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #fff;
    font-family: PingFangSC-Regular, PingFang SC;
    position: relative;
  }
}

.innerbox {
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  width: 100%;
  height: 100%;

  &__item {
    height: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    > span {
      margin-right: 10px;
    }
  }
}

.input-class {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  opacity: 0;
  cursor: pointer;
  z-index: 2;
}

.btn {
  display: flex;
  padding: 0 10%;
  justify-content: space-between;
  font-size: 22px;
  font-family: PingFangSC-Medium, PingFang SC;
  font-weight: 500;
  color: #888888;
  line-height: 30px;
  letter-spacing: 2px;
  span {
    display: flex;
    justify-content: center;
    align-items: center;
    width: get-vw(216px);
    height: get-vh(80px);
    border-radius: 5px;
    border: 2px solid #7d7d7d;
    cursor: no-drop;
  }
  .cancel {
    color: #fff;
    border-color: #fff;
    cursor: pointer;
  }
  .active {
    color: #fff;
    border-color: #fff;
    cursor: pointer;
  }
}
/deep/.ivu-radio {
  margin-right: 20px;
}
/deep/.ivu-radio-wrapper {
  font-size: 16px;
}
</style>
