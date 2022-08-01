<template>
  <div class="mask">
    <div class="mask__main">
      <div id="box" class="box">
        <sx-icon type="icon-boxtag-fill" />
        <p>{{ loadContext }}</p>

        <input
          ref="fileInput"
          type="file"
          multiple
          accept="image/jpeg,image/jpg,image/png"
          @change="uploadImg"
        />
      </div>
      <div v-if="!isAdd" class="btn">
        <span :class="isActive ? 'active' : ''" @click="enterEdit(0)"
          >图片分类</span
        >
        <span :class="isActive ? 'active' : ''" @click="enterEdit(1)"
          >对象检测</span
        >
      </div>
      <div v-else class="btn" :class="loadContext ? 'btn-active' : ''">
        <span :class="isActive ? 'active' : ''" @click="enterEdit(type)"
          >确定</span
        >
        <span class="active" @click="enterEdit(2)">取消</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { saveFileList } from 'utils/COCOImporter'
import { unique } from 'utils/tools'

@Component({
  components: {},
})
export default class SXMask extends Vue {
  @Prop({
    type: Number,
  })
  loadPicNum

  @Prop({
    type: Boolean,
  })
  isAdd: boolean

  @Prop({
    type: Number,
  })
  type: number

  isActive = false

  get loadContext() {
    let picNum = this.picUrlList.length + this.loadPicNum

    return picNum === 0
      ? '点击上传本次标图任务所需的图片'
      : `已选择${picNum}张图片`
  }

  picUrlList = [] as Array<any>

  uploadImg() {
    const fileList = this!.$refs!.fileInput!['files'] as any
    saveFileList(fileList)

    Array.from(fileList).forEach((file: any) => {
      this.picUrlList.push(file)
    })
    this.picUrlList = unique(this.picUrlList, 'name')
    this.isActive = true
  }

  enterEdit(type) {
    if (type !== 2) {
      this.$emit('enterEdit', type, this.picUrlList)
    } else {
      this.$emit('enterEdit', type, [])
    }
    this.picUrlList = []

    this.isActive = false
  }
}
</script>

<style lang="scss" scoped>
.mask {
  //   width: 100%;
  //   height: 100%;
  //   background: #535353;
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

.box {
  height: get-vh(460px);
  border-radius: 5px;
  border: 2px solid #ffffff;
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;

  .sui-icon-normal {
    width: 90px;
    height: 90px;
    margin-bottom: 10px;
  }

  > p {
    font-size: 16px;
    font-family: PingFangSC-Regular, PingFang SC;
    font-weight: 400;
    color: #ffffff;
    line-height: 22px;
    letter-spacing: 2px;
  }

  > input {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    opacity: 0;
    cursor: pointer;
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
  > span {
    display: flex;
    justify-content: center;
    align-items: center;
    width: get-vw(216px);
    height: get-vh(80px);
    border-radius: 5px;
    border: 2px solid #7d7d7d;
    cursor: no-drop;
  }
}

.active {
  color: #fff;
  border-color: #fff;
  cursor: pointer !important;
}
</style>
