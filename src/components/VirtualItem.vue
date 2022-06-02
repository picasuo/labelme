<template>
  <div
    class="img__item"
    :class="currentPicUrl === source.url ? 'img-active' : ''"
    @click="loadExpImg(source)"
  >
    <div
      class="img__background"
      :style="{ backgroundImage: `url(${source.url})` }"
    ></div>

    <div class="img__info">
      <p class="img__name" :title="source.name">
        {{ handlePicName(source.name, 5) }}
      </p>
      <p>{{ source.format }}</p>
      <sx-icon
        v-if="
          (labelListMap[source.name] && labelListMap[source.name].length > 0) ||
          (objMap[source.name] && objMap[source.name].length > 1)
        "
        size="small"
        type="icon-yiwancheng"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { handlePicName } from '../utils/tools'

@Component({
  components: {},
})
export default class VirtualItem extends Vue {
  @Prop({
    type: Object,
    required: true,
    default: {},
  })
  source: object
  @Prop({
    type: Object,
    required: true,
    default: {},
  })
  objMap: object
  @Prop({
    type: String,
    required: true,
    default: {},
  })
  currentPicUrl: string
  handlePicName = handlePicName
  loadExpImg() {}
}
</script>

<style lang="scss" scoped>
.img {
  font-size: 12px;
  font-family: PingFangSC-Regular, PingFang SC;
  font-weight: 400;
  color: #ffffff;
  line-height: 17px;
  letter-spacing: 1px;
  &__item {
    height: 70px;
    background: #535353;
    border: 1px solid #454545;
    padding: 8px 15px;
    display: flex;
    align-items: center;
  }
  &-active {
    background: #66656a;
    border: 2px solid #488feb;
  }
  &__background {
    width: 54px;
    height: 54px;
    background: center;
    background-repeat: no-repeat;
    background-size: contain;
    margin-right: 10px;
  }

  &__info {
    flex: 1;
    display: flex;
    justify-content: space-between;
  }
}
</style>
