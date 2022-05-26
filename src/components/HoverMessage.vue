<template>
  <div class="message">Drag Tool(D)</div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'

@Component({
  components: {},
})
export default class HoverMessage extends Vue {
  @Prop({
    type: String,
  })
  content: string
}
</script>

<style lang="scss" scoped>
.message {
  position: absolute;
  transform: translate3d(-157px, 311px, 0);
  font-family: PingFangSC-Regular, PingFang SC;
  font-weight: 400;
  font-size: 22px;
}
</style>
