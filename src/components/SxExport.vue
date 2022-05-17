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
import { Radio, RadioGroup } from 'iview'

@Component({
  components: {
    iRadioGroup: RadioGroup,
    iRadio: Radio,
  },
})
export default class SxExport extends Vue {
  tabs = ['矩形', '多边形']
  checkedTab = 0
  checked = null as any
  tabName = '' as any
  get exportRadio() {
    let arr = [] as any
    switch (this.tabName) {
      case '矩形':
        arr = [
          { name: 'VOC XML', label: 'RectVOC' },
          { name: 'COCOJson', label: 'RectCOCO' },
        ]
        break
      case '多边形':
        arr = [
          { name: 'COCOJson', label: 'PolyCOCO' },
          { name: 'VGGJson', label: 'PolyVGG' },
        ]
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
  exportData() {
    this.$emit('exportData', this.checked)
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
</style>
