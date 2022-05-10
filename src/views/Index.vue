<template>
  <div class="tool">
    <div class="tool_bar"></div>
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
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import SxMask from './SxMask.vue'

@Component({
  components: {
    SxMask,
  },
})
export default class Index extends Vue {
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
        reject: (value: string) => void,
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
      },
    )
  }

  enterEdit(type) {
    // todo
    console.log('type', type)
  }
}
</script>

<style lang="scss" scoped>
.tool {
  width: 100%;
  height: 100%;
  padding: 0 !important;
  display: grid;
  grid-template-columns: get-vw(60px) 1fr get-vw(360px);
  background: #535353;
  position: relative;
  &_content {
    background: #282828;
  }
  .label {
    height: get-vh(450px);
  }
  .img {
    height: get-vh(630px);
  }
  .nav {
    height: get-vh(50px);
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
    }
  }
}
</style>
