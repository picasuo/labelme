<template>
  <div class="index">
    <sx-header title="标图任务列表">
      <sx-button @click="createTask">创建新任务</sx-button>
    </sx-header>
    <sx-table
      :columns="tableColumns"
      :data="tableData"
      :loading="tableLoading"
    />
    <sx-modal
      v-model="isShow"
      title="创建任务"
      ok-text="确定"
      cancel-text="取消"
      error-text="error"
      @on-ok="onConfirm"
      @on-cancel="onCancel"
    >
      <div class="upload">
        <div class="upload_type">
          <span>任务类型：</span>
          <i-select
            v-model="currentType"
            class="upload_selecttag"
            placeholder="选择任务类型"
          >
            <i-option
              v-for="item in typeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </i-select>
        </div>
        <div class="upload_img">
          <span>上传文件：</span>
          <div class="upload_img_content">
            <div class="upload_img_box" :style="picStyles">
              <sx-icon
                v-if="!pic"
                type="icon-import"
                color="#d5d7da"
                size="large"
              />
              <p v-if="!pic">jpg/批量上传jpg/文件夹</p>
            </div>
            <a class="upload_img_tool"
              >上传文件<input
                ref="fileInput"
                type="file"
                multiple
                accept="*.jpeg,*.jpg,*.png"
                @change="onFileChange"
            /></a>
          </div>
        </div>
      </div>
    </sx-modal>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

@Component({
  components: {},
})
export default class Home extends Vue {
  isShow = false
  currentType = 0
  typeOptions = [
    {
      label: '检测任务',
      value: 0,
    },
    {
      label: '语义分割',
      value: 1,
    },
    {
      label: '分类',
      value: 2,
    },
  ]
  tableLoading = false
  tableData = [
    {
      no: 1,
      num: 20,
      create_time: '2022.05.05 15:32:06',
      type: '检测任务',
      label: '表格 文字',
      state: '16/20',
    },
  ]
  tableColumns = [
    {
      title: '编号',
      align: 'center',
      key: 'no',
    },
    {
      title: '标图任务量',
      align: 'center',
      key: 'num',
    },
    {
      title: '创建时间',
      align: 'center',
      key: 'create_time',
    },
    {
      title: '任务类型',
      align: 'center',
      key: 'type',
    },
    {
      title: '使用标签',
      align: 'center',
      key: 'label',
    },
    {
      title: '任务状态',
      align: 'center',
      key: 'state',
    },
    {
      title: '操作',
      align: 'center',
      key: 'action',
      render: (h, params) => {
        return h(
          'p',
          {
            style: { display: 'flex', justifyContent: 'center' },
          },
          [
            h(
              'span',
              {
                props: {
                  type: 'primary',
                  size: 'small',
                },
                style: {
                  color: '#4883FB',
                  cursor: 'pointer',
                  display: 'inline-block',
                  marginRight: '5%',
                },
                on: {
                  click: () => {
                    this.$router.push({
                      path: '/imagetool',
                      query: {
                        id: '1',
                      },
                    })
                  },
                },
              },
              '查看详情',
            ),
            h(
              'span',
              {
                props: {
                  type: 'primary',
                  size: 'small',
                },
                style: {
                  color: '#ED5555',
                  cursor: 'pointer',
                },
                on: {
                  click: () => {},
                },
              },
              '删除',
            ),
          ],
        )
      },
    },
  ]

  pic = '' as any
  fileList = [] as any
  picUrlList = [] as Array<any>

  get picStyles() {
    const { pic } = this

    return pic ? { 'background-image': `url(${pic})` } : {}
  }

  createTask() {
    this.pic = ''
    this.isShow = true
  }
  onConfirm() {
    this.isShow = false
  }
  onCancel() {
    this.isShow = false
  }
  onFileChange() {
    const fileList = this!.$refs!.fileInput!['files']

    this.getUrlList(fileList)
      .then(val => {
        // todo
        console.log('val', val)

        this.pic = val[0]
        this.picUrlList = val
      })
      .catch(err => {
        this.pic = ''
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
}
</script>

<style lang="scss" scoped>
.index {
  .upload {
    padding: 0 get-vw(80px);
    span {
      font-size: 14px;
      font-family: PingFangSC-Regular, PingFang SC;
      font-weight: 400;
      color: #4a4a4a;
      line-height: 32px;
      letter-spacing: 1px;
    }
    &_type {
      display: flex;
      margin-bottom: get-vh(30px);
    }
    &_selecttag {
      width: 330px;
    }
    &_img {
      display: flex;
      &_content {
        display: flex;
        flex-direction: column;
        align-items: center;
      }
      &_box {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        width: 330px;
        height: 219px;
        border-radius: 2px;
        border: 1px solid #dcdee2;
        background-size: 100% 100%;
        background-repeat: no-repeat;
        p {
          font-size: 12px;
          font-family: PingFangSC-Regular, PingFang SC;
          font-weight: 400;
          color: #7d7d7d;
          line-height: 17px;
          letter-spacing: 1px;
        }
      }
      &_tool {
        margin-top: get-vh(15px);
        border-bottom: 1px dashed #4883fb;
        position: relative;

        input {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          opacity: 0;
        }
      }
    }
  }
}
</style>
