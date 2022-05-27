<template>
  <div class="export">
    <div class="export__main">
      <div class="header">
        <span>导出数据集</span>
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
          <i-radio-group v-model="checked" vertical>
            <i-radio
              v-for="(item, index) in exportRadio"
              :key="index"
              :label="item.label"
              >{{ item.name }}</i-radio
            >
          </i-radio-group>
          <div class="database">
            <div class="number">
              <span>{{ `Train: ${train}` }}</span>
              <span>{{ `Valid: ${valid}` }}</span>
              <span>{{ `Test: ${test}` }}</span>
            </div>
            <i-slider
              v-model="sliderArr"
              range
              :max="max"
              @on-change="sliderChange"
            />
          </div>
        </div>
      </div>
      <div class="btn">
        <span :class="checked !== null ? 'active' : ''" @click="exportData"
          >确定</span
        >
        <span class="cancel" @click="cancel">取消</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { Radio, RadioGroup, Slider } from 'iview'

@Component({
  components: {
    iRadioGroup: RadioGroup,
    iRadio: Radio,
    iSlider: Slider,
  },
})
export default class SxExport extends Vue {
  // 0-分类 1-对象
  @Prop({
    type: Number,
  })
  type: number
  @Prop({
    type: Number,
  })
  picNum: number

  checkedTab = 0
  checked = null as any
  tabName = '' as any
  train = 0 as any
  valid = 0 as any
  test = 0 as any
  sliderArr = [0, 0]

  get max() {
    this.sliderArr = [this.picNum, this.picNum]
    this.train = this.picNum
    this.valid = 0
    this.test = 0
    return this.picNum
  }

  get tabs() {
    let arr = [] as any
    switch (this.type) {
      case 0:
        arr = ['图片分类']
        break
      case 1:
        arr = ['全部导出', '矩形', '多边形']
        break
    }
    return arr
  }
  get exportRadio() {
    let arr = [] as any
    switch (this.tabName) {
      case '图片分类':
        arr = [{ name: 'Json', label: 'ImgJson' }]
        break
      case '全部导出':
        arr = [
          { name: 'VOC XML', label: 'VOC' },
          { name: 'COCOJson', label: 'COCO' },
        ]
        break
      case '矩形':
        arr = [{ name: 'YOLO v5', label: 'RectYOLO' }]
        break
      case '多边形':
        arr = [{ name: 'VGGJson', label: 'PolyVGG' }]
        break
    }
    return arr
  }
  mounted() {
    this.changeTab(0, this.tabs[0])
  }
  changeTab(type, item) {
    this.tabName = item
    this.checkedTab = type
    this.checked = null
  }
  cancel() {
    this.$emit('cancel')
  }
  sliderChange(val) {
    this.train = val[0]
    this.valid = val[1] - val[0]
    this.test = this.max - val[1]
  }
  exportData() {
    const rate = {
      train: this.train,
      valid: this.valid,
      test: this.test,
    }
    this.$emit('exportData', this.checked, rate)
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
    flex-direction: column;
    justify-content: center;
    align-items: center;
    color: #fff;
    font-family: PingFangSC-Regular, PingFang SC;
    .database {
      width: 70%;
      margin-top: 30px;
      .number {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
      }
      span {
        display: inline-flex;
        justify-content: center;
        font-size: 16px;
        font-weight: 400;
      }
      .rate {
        width: 100px;
      }
    }
  }
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

/deep/.ivu-slider-bar {
  background: #646464;
}
/deep/.ivu-slider-button {
  border: 2px solid #fff;
}
</style>
