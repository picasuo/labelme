<template>
  <div class="index">
    <div class="header">
      <p>
        正在进行的任务<span>{{ 20 }}</span
        >{{ '/100' }}
      </p>
      <sx-icon class="exit" type="icon-tuichu" @click="exit" />
    </div>
    <div class="tool">
      <div class="tool_bar">
        <div
          class="icon"
          :class="checkedTab === index ? 'checked' : ''"
          v-for="(item, index) in icons"
          :key="index"
          @click="tabClick(index)"
        >
          <sx-icon :type="item" />
        </div>
      </div>
      <div class="tool_content"></div>
      <div class="tool_manage">
        <div class="label">
          <div class="nav">
            <span class="title">标签管理</span>
          </div>
        </div>
        <div class="img">
          <div class="nav">
            <span class="title">图片管理</span>
            <span>{{ 20 }}</span>
          </div>
        </div>
      </div>
      <SxMask
        v-if="isShown"
        @uploadImg="uploadImg"
        @enterEdit="enterEdit"
        :loadContext="loadContext"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import SxMask from 'components/SxMask.vue'

@Component({
  components: {
    SxMask,
  },
})
export default class Index extends Vue {
  icons = ['icon-export'] as any
  checkedTab = 0
  // 区分分类以及对象识别
  iconShow = false
  isShown = true
  picUrlList = [] as Array<any>

  get loadContext() {
    const str =
      this.picUrlList.length > 0 ? `已选择${this.picUrlList.length}张图片` : ''
    return str
  }

  uploadImg(list) {
    this.getUrlList(list)
      .then(val => {
        // todo
        console.log('val', val)

        // this.pic = val[0]
        this.picUrlList = val
      })
      .catch(err => {
        // this.pic = ''
        this.$SxMessage.error(err)
      })
  }

  getUrlList(fileList) {
    return new Promise(
      (
        resolve: (value: Array<string>) => void,
        reject: (value: string) => void
      ) => {
        const picUrlList = [] as Array<any>
        Array.prototype.forEach.call(fileList, (file, index) => {
          if (!/image\/(png|jp(e)g)$/.test(file.type)) {
            reject('请上传正确格式的图片')
            return
          }

          const reader = new FileReader() as any
          reader.readAsDataURL(file)
          reader.onload = () => {
            picUrlList.push(reader.result)
            if (picUrlList.length === fileList.length) {
              resolve(picUrlList)
            }
          }
        })
      }
    )
  }

  // 0-分类 1-检测
  enterEdit(type) {
    this.isShown = false
    this.icons =
      type === 0
        ? ['icon-export']
        : [
            'icon-export',
            'icon-icon-',
            'icon-pentoolgangbigongju',
            'icon-huajuxing_0',
          ]
    // todo
    console.log('type', type)
  }
  // 0-导出 1-移动 2-钢笔 3-矩形
  tabClick(tab) {
    this.checkedTab = tab
  }
  // 退出
  exit() {
    this.isShown = true
    this.picUrlList = []
  }
}
</script>

<style lang="scss" scoped>
.index {
  .header {
    height: 40px;
    background: #151515;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    p {
      font-size: 12px;
      font-family: PingFangSC-Medium, PingFang SC;
      font-weight: 500;
      line-height: 20px;
      letter-spacing: 1px;
      color: #fff;
    }
    span {
      margin-left: 15px;
      color: #488feb;
    }
    .exit {
      position: absolute;
      right: 1%;
      cursor: pointer;
    }
  }
  .tool {
    display: grid;
    grid-template-columns: get-vw(60px) 1fr get-vw(360px);
    background: #535353;
    &_bar {
      .icon {
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        width: get-vw(60px);
        height: get-vw(60px);
      }
      .checked {
        background: #488feb;
      }
    }
    &_content {
      background: #282828;
    }
    &_manage {
      .label {
        height: get-vh(450px);
      }
      .img {
        height: get-vh(630px);
      }
      .nav {
        height: get-vw(50px);
        background: #424242;
        padding: 0 get-vw(20px);
        display: flex;
        justify-content: space-between;
        align-items: center;
        span {
          font-size: 14px;
          font-family: PingFangSC-Regular, PingFang SC;
          font-weight: 400;
          color: #dddddd;
          line-height: 20px;
          letter-spacing: 1px;
        }
        .title {
          font-family: PingFangSC-Medium, PingFang SC;
          font-weight: 500;
          cursor: default;
        }
      }
    }
  }
  .sui-icon-normal {
    width: 25px;
    height: 25px;
  }
}
</style>
