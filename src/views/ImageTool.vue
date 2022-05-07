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
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

@Component({
  components: {},
})
export default class Home extends Vue {}
</script>

<style lang="scss" scoped>
.tool {
  width: 100%;
  height: 100%;
  padding: 0 !important;
  display: grid;
  grid-template-columns: get-vw(60px) 1fr get-vw(360px);
  background: #535353;
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
