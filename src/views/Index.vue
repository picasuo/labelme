<template>
  <div class="index" :class="inputModalVisiable ? 'indexmask' : ''">
    <div class="header">
      <p>
        正在进行的任务<span>{{ hasEditedNum }}</span
        >{{ `/${loadPicNum && !isShown ? loadPicNum : 0}` }}
      </p>
      <p class="exit">
        <sx-icon type="icon-tuichu" @click="exit" />
      </p>
    </div>
    <div id="tool" class="tool">
      <div class="tool_bar">
        <div
          class="icon"
          :class="{ hover: true, checked: checkedTab === index }"
          v-for="(item, index) in icons"
          :key="index"
          :data-line="item.content"
          @click="tabClick(index)"
        >
          <sx-icon :type="item.icon" color="#ffffff" />
        </div>
      </div>

      <SxExplanation v-if="isExplanation" />

      <div class="tool_content" id="tool_content">
        <canvas id="canvas" :width="width" :height="height"></canvas>

        <img id="img" :src="currentPicUrl" />
      </div>
      <div class="tool_manage">
        <div class="label">
          <div class="nav">
            <span>标签管理</span>
          </div>

          <div class="label__main" :class="inputModalVisiable ? 'modal' : ''">
            <span class="label__btn" @click="switchInputLabel">{{
              inputModalVisiable ? '!停止添加' : '+添加标签'
            }}</span>
            <div class="modal" v-if="inputModalVisiable">
              <sx-input
                v-model="label"
                level="fragment"
                clearable
                type="text"
                @on-enter="getLabel"
                placeholder="输入标签名"
              />
              <sx-button @click="getLabel">确定</sx-button>
            </div>
          </div>
          <div class="label__list" v-if="labelList.length > 0">
            <span
              class="label__item"
              v-for="(item, index) in labelList"
              :data-sign="'快捷键' + (index + 1) + '绑定标签'"
              :style="{
                backgroundColor: item.color,
                border: `1px solid  ${item.color}`,
              }"
              :key="item.color"
              @click="selectLabel(item)"
              >{{ item.name }}</span
            >
          </div>

          <ul class="table" v-if="currentLabelList.length > 0">
            <li
              class="table__item"
              v-for="(label, i) in currentLabelList"
              :key="label.name"
            >
              <div>
                <span
                  class="table__circle"
                  :style="{ backgroundColor: label.color }"
                ></span>
                <span>{{ label.name }}</span>
              </div>

              <div>
                <sx-icon
                  type="icon-shanchu"
                  size="small"
                  v-if="type === 0"
                  @click="delLabel(i)"
                />
                <span
                  class="table__count"
                  :style="{ backgroundColor: label.color }"
                  >{{ label.count }}</span
                >
              </div>
            </li>
          </ul>
        </div>

        <div class="img">
          <div class="nav">
            <span>图片管理</span>
            <span class="addImg" @click="addImg">继续添加</span>
          </div>
          <ul class="img__list">
            <li
              v-for="(item, index) in picList"
              :key="index"
              class="img__item"
              :class="currentPicName === item.name ? 'img-active' : ''"
              @click="getPic(item)"
            >
              <div class="img__mini">
                <img :dataSrc="item.name" alt="加载中" />
              </div>
              <div class="img__info">
                <p class="img__name" :title="item.name">
                  {{ handlePicName(item.name, 5) }}
                </p>
                <p>{{ item.format }}</p>
                <sx-icon
                  v-if="
                    (labelListMap[item.name] &&
                      labelListMap[item.name].length > 0) ||
                    (objMap[item.name] && objMap[item.name].length > 1)
                  "
                  size="small"
                  type="icon-yiwancheng"
                />
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <SxMask
      v-if="isShown"
      @enterEdit="enterEdit"
      :type="type"
      :loadPicNum="loadPicNum"
      :isAdd="isAdd"
    />

    <SxExport
      v-if="isExport"
      :type="type"
      :picNum="changedPic.length"
      @cancel="cancel"
      @exportData="submit"
    />

    <SxImport
      v-if="isImport"
      :type="type"
      :isTxtLoaded="isTxtLoaded"
      :isYamlLoaded="isYamlLoaded"
      @cancelImport="cancelImport"
      @uploadStatus="uploadStatus"
      @importData="confirmImport"
      @setAnnotation="setAnnotation"
    />

    <!-- 垂直线 -->
    <div
      ref="crosshair-h"
      id="crosshair-h"
      :class="isLineShown ? 'hide-hair' : 'hair'"
    ></div>
    <!-- 水平线 -->
    <div
      ref="crosshair-v"
      id="crosshair-v"
      :class="isLineShown ? 'hide-hair' : 'hair'"
    ></div>
    <!-- <div ref="cursor-d" id="cursor-d" class="dotx"></div> -->
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import SxMask from 'components/SxMask.vue'
import SxExport from 'components/SxExport.vue'
import SxExplanation from 'components/SxExplanation.vue'
import {
  handlePicName,
  Colors,
  getPicResolution,
  shortCuts,
} from '../utils/tools'
import { fabric } from 'fabric'
import { polyEdit } from 'utils/PolygonControl'
import hotkeys from 'hotkeys-js'
import { exportVGG } from 'utils/VGGExporter'
import { exportCOCO } from 'utils/COCOExporter'
import { exportVOC } from 'utils/VOCXMLExporter'
import { exportYOLO } from 'utils/YOLOExporter'
import { exportImgJson } from 'utils/ImgJsonExport'
import SxImport from 'components/SxImport.vue'
import Sortable from 'sortablejs'
import { getPic } from 'utils/tools'

@Component({
  components: {
    SxMask,
    SxExport,
    SxImport,
    SxExplanation,
  },
})
export default class Index extends Vue {
  icons = [] as any

  checkedTab = 0
  // 区分分类以及对象识别
  //   iconShow = false
  isShown = true
  isExport = false
  isImport = false

  isExplanation = false

  get isLineShown() {
    return this.isImport ||
      this.isExport ||
      this.isExplanation ||
      this.isShown ||
      this.inputModalVisiable
      ? true
      : false
  }

  deepObjMap = {} as any
  changedPic = [] as any

  // 区分添加还是初始化
  isAdd = false
  //存储编辑模式
  type = 0

  picList = [] as Array<any>
  clonePicList = [] as Array<any>

  canvas = {} as any
  // 回退状态
  undoStack = [] as any
  redoStack = [] as any

  x = ''
  y = ''

  mouseFrom = {} as any
  mouseTo = {} as any
  canvasObjectIndex = 0
  rectangleLabel = 'warning'
  drawWidth = 1 //笔触宽度
  color = '#C7FC00' //画笔颜色
  drawingObject = null //当前绘制对象
  moveCount = 1 //绘制移动计数器
  doDrawing = false // 绘制状态

  //polygon 相关参数
  polygonMode = false
  pointArray = [] as any
  lineArray = [] as any
  activeShape = null as any
  activeLine = null as any
  line = {} as any

  //只影响图片缩放
  width = 800
  height = 600

  currentPicUrl = ''
  currentPicName = ''

  repeatObjs = [] as any

  imagesData = [] as Array<any>
  labelNames = [] as Array<any>

  get loadPicNum() {
    return this.picList?.length || 0
  }

  handlePicName = handlePicName
  getPicResolution = getPicResolution

  objMap = {} as any

  //存储队列中每张图片的label表格数据
  labelListMap = {} as Record<string, Array<any>>

  lastName = ''

  label = ''
  //标签输入框是否可见
  inputModalVisiable = false
  labelList = [] as Array<any>
  hasEditedNum = 0
  //当前图片绑定的label
  currentLabelList = [] as Array<any>

  getLabel() {
    if (!this.label) return
    if (this.labelList.find(label => label.name === this.label)) {
      this.$SxMessage.error('该标签已添加')
      return
    }
    this.labelList.push({ name: this.label, color: Colors.random() })
    this.label = ''
    //设置label快捷键
    this.setLabelShortCut(
      this.labelList[this.labelList.length - 1],
      this.labelList.length
    )
  }

  //新增label，绑定快捷键,防止，遍历一个按键多次绑定快捷键
  setLabelShortCut(lable, num) {
    hotkeys(num.toString(), (event, handler) => {
      event.preventDefault()
      const { name, color } = lable
      this.handleLabelBind({
        newName: name,
        newColor: color,
        index: -1,
      })
    })
  }

  //设置labels快捷键
  setLabelsShortCuts() {
    this.labelList.forEach((item, index) => {
      hotkeys((index + 1).toString(), (event, handler) => {
        event.preventDefault()
        const { name, color } = item
        this.handleLabelBind({
          newName: name,
          newColor: color,
          index: -1,
        })
      })
    })
  }

  //绑定-取消绑定标签到对象上
  //处理标签列表数据
  //index -1：添加 其他:删除
  handleLabelBind({ newName, newColor, index }) {
    const list = [] as Array<any>
    const activeObj = this.canvas.getActiveObject()

    if (this.type === 0) {
      let { labelName = [] as any } = activeObj
      if (index === -1) {
        labelName.push(newName)
        labelName = Array.from(new Set(labelName))
      } else {
        labelName.splice(index, 1)
      }

      activeObj.set({
        labelName,
      })

      labelName.forEach(label => {
        const { name, color } = this.labelList.find(item => item.name === label)
        list.push({
          name,
          color,
          count: 1,
        })
      })
      this.currentLabelList = list
    } else {
      if (activeObj && activeObj.name !== 'img') {
        activeObj.set({
          fill: newColor,
          labelName: newName,
          //   borderColor: color
        })
        this.canvas.renderAll()
        this.updateModifications()
        this.labelList.forEach(label => {
          const { name, color } = label
          let count = 0
          this.canvas.getObjects().forEach(obj => {
            const { labelName = '' } = obj
            if (labelName === name) {
              count++
            }
          })
          if (count > 0) {
            list.push({
              name,
              color,
              count,
            })
          }
        })

        this.currentLabelList = list
      }
      //   else {
      //     this.$SxMessage.error('请先在画布中选择对象！')
      //   }
    }
  }

  selectLabel(label) {
    const { name, color } = label
    this.handleLabelBind({
      newName: name,
      newColor: color,
      index: -1,
    })
  }

  //删除绑定标签
  delLabel(index) {
    this.handleLabelBind({ newName: '', newColor: '', index })
  }

  getPic(item) {
    getPic(item)
      .then(val => {
        this.loadExpImg(val)
      })
      .catch(err => {
        this.$SxMessage.error(err)
      })
  }

  loadExpImg(item) {
    //切换图片的时候重置操作栈
    this.undoStack = []
    this.redoStack = []
    const { url, name } = item
    // console.log('lastName:', this.lastName)
    // console.log('currentLabelList:', this.currentLabelList)
    if (this.lastName) {
      this.objMap[this.lastName] = this.canvas.getObjects()
      this.labelListMap[this.lastName] = this.currentLabelList
    }
    // 保存上一个页面的最后状态用于重复框选操作
    this.saveRepeatState()

    this.canvas.clear()

    this.currentPicUrl = url
    this.currentPicName = name

    this.addImgToCanvas(name).then(() => {
      //将导入文件添加到画板和标签列表中
      this.addAnnotationToCanvas(name)

      if (this.type === 0) {
        this.canvas.setActiveObject(this.canvas.getObjects()[0])
        this.canvas
          .getActiveObject()
          .set({ lockMovementX: true, lockMovementY: true, hasBorders: false })
      }

      //判断。重现label列表数据
      this.currentLabelList = this.labelListMap[name]
        ? this.labelListMap[name]
        : []

      this.lastName = name

      this.hasEditedNum = this.computeEditedSession()

      this.updateModifications()
    })
  }

  //将导入文件添加到画板和标签列表中
  addAnnotationToCanvas(name) {
    const prefixName = name.slice(0, name.lastIndexOf('.'))
    const imgData = this.imagesData.find(img => img.imgName === prefixName)

    if (imgData && !imgData.loadStatus) {
      //   // todo
      //   console.log('imgdata', imgData, name)
      //再次导入yaml文件，删除之前的注解canvas对象
      this.canvas.getObjects().forEach((canvasObj, index) => {
        if (canvasObj.isAnnoation) {
          this.canvas.remove(canvasObj)
          this.objMap[name].splice(index, 1)
        }
      })

      //再次导入yaml文件，删除之前的注解label
      if (this.labelListMap[name] && this.labelListMap[name].length > 0) {
        const labels = [] as any
        this.labelListMap[name].forEach(label => {
          if (!label.isAnnoation) {
            labels.push(label)
          }
        })
        this.labelListMap[name] = labels
      }

      //!拿到图片的宽高左右
      const { width, height, aCoords } = this.canvas.getObjects()[0]
      const { bl, br, tl, tr } = aCoords
      //!求出img在图层中缩放后的宽高以及它相对于图层的left、top
      const imgWidth = br.x - bl.x
      const imgHeight = bl.y - tl.y

      const left = tl.x
      const top = tl.y
      const widthRate = width / imgWidth
      const heightRate = height / imgHeight

      const {
        labelRects = [] as Array<any>,
        labelPolygons = [] as Array<any>,
      } = imgData
      //!当前图片labelMap
      let labelMap = {} as Record<string, any>

      labelRects.forEach(rectItem => {
        let rectWidth = 0
        let rectHeight = 0
        let rectLeft = 0
        let rectTop = 0
        const { labelId } = rectItem

        if (imgData.isYolo) {
          const { bbox } = rectItem
          rectWidth = bbox[2] * imgWidth
          rectHeight = bbox[3] * imgHeight
          rectLeft = bbox[0] * imgWidth - 0.5 * rectWidth + left
          rectTop = bbox[1] * imgHeight - 0.5 * rectHeight + top
        } else {
          const { rect } = rectItem
          rectWidth = rect.width / widthRate
          rectHeight = rect.height / heightRate
          rectLeft = rect.x / widthRate + left
          rectTop = rect.y / heightRate + top
        }

        const { name: labelName, color } = this.labelNames.find(
          label => label.id === labelId,
        )

        if (!labelMap[labelName]) {
          labelMap[labelName] = {
            color,
            name: labelName,
            count: 1,
            isAnnoation: true,
          }
        } else {
          labelMap[labelName].count++
        }

        const rectangle = new fabric.Rect({
          width: rectWidth,
          height: rectHeight,
          fill: color,
          left: rectLeft,
          top: rectTop,
          labelName,
          lockRotation: true,
          name: 'rectangle',
          opacity: 0.5,
          transparentCorners: false,
          cornerStrokeColor: '#000',
          cornerColor: '#fff',
          stroke: this.color,
          strokeWidth: this.drawWidth,
          isAnnoation: true,
          // stroke:'green',
          // strokeWidth:3,
          //   centeredRotation: true,
        })
        this.canvas.add(rectangle)
      })

      labelPolygons.forEach((polygonItem, index) => {
        const { name: labelName, color } = this.labelNames.find(
          label => label.id === polygonItem.labelId,
        )

        const { segmentation } = polygonItem
        const points = [] as Array<any>
        segmentation.forEach(item => {
          //   item.x = item.x / widthRate + left
          //   item.y = item.y / heightRate + top

          points.push({
            x: item.x / widthRate + left,
            y: item.y / heightRate + top,
          })
        })

        const polygon = new fabric.Polygon(points, {
          stroke: this.color,
          strokeWidth: this.drawWidth,
          fill: color,
          labelName,
          objectCaching: false,
          opacity: 0.5,
          transparentCorners: false,
          cornerStrokeColor: '#000',
          cornerColor: '#fff',
          //   hasBorders: false,
          name: 'polygon',
          isAnnoation: true,
        })

        this.canvas.add(polygon)

        if (!labelMap[labelName]) {
          labelMap[labelName] = {
            color,
            name: labelName,
            count: 1,
            isAnnoation: true,
          }
        } else {
          labelMap[labelName].count++
        }
        // // todo
        // console.log('canvas', this.canvas)
      })

      this.labelListMap[name] = this.labelListMap[name]
        ? this.labelListMap[name].concat(Object.values(labelMap))
        : Object.values(labelMap)
      imgData.loadStatus = true
    }
  }

  //计算正在进行的任务
  computeEditedSession() {
    let count = 0
    if (this.type === 0) {
      Object.keys(this.labelListMap).forEach(item => {
        if (this.labelListMap[item].length > 0) {
          count++
        }
      })
    } else {
      for (let key in this.objMap) {
        if (this.objMap[key].length > 1) {
          count++
        }
      }
    }
    return count
  }

  //将图片加载到画布中
  addImgToCanvas(name) {
    return new Promise(
      (resolve: (value: any) => void, reject: (value: any) => void) => {
        //!再次加载，导入之前保存的数据
        if (this.objMap[name]?.length > 0) {
          this.objMap[name].forEach(v => {
            this.canvas.add(v)
          })
          resolve('')
        } else {
          //!首次加载,根据图片原尺寸来等比例缩放长宽
          fabric.Image.fromURL(this.currentPicUrl, oImg => {
            oImg.scaleToHeight(this.height)
            let currentWidth = (this.height * oImg.width) / oImg.height
            let currentHeight = this.height
            oImg.scaleToWidth(currentWidth)
            if (currentWidth > this.width) {
              oImg.scaleToWidth(this.width)
              currentWidth = this.width
              currentHeight = (this.width * oImg.height) / oImg.width
              oImg.scaleToHeight(currentHeight)
            }
            //居中
            const left = (this.canvas.width - currentWidth) / 2
            const top = (this.canvas.height - currentHeight) / 2
            oImg.set({
              name: 'img',
              top,
              left,
              selectable: true,
              hasBorders: false,
              hasControls: false,
              hasRotatingPoint: false,
              lockMovementX: true,
              lockMovementY: true,
              lockRotation: true,
              curWidth: currentWidth,
              curHeight: currentHeight,
            })
            this.canvas.add(oImg)
            resolve('')
          })
        }
      },
    )
  }

  // 0-分类 1-检测
  enterEdit(type, val) {
    this.type = type
    if (type !== 2) {
      this.icons =
        type === 0
          ? [
              { icon: 'icon-wenjiandaoru', content: '导入文件' },
              { icon: 'icon-export', content: '导出文件' },
              { icon: 'icon-wenhao', content: '说明' },
            ]
          : [
              { icon: 'icon-wenjiandaoru', content: '导入文件' },
              { icon: 'icon-export', content: '导出文件' },
              { icon: 'icon-icon-', content: '拖拽工具(s)' },
              { icon: 'icon-pentoolgangbigongju', content: '套索工具(p)' },
              { icon: 'icon-huajuxing_0', content: '矩形工具(r)' },
              { icon: 'icon-qiangzhiqingchu', content: '清除本图注解(n)' },
              { icon: 'icon-shuaxin', content: '重复上次框选(c)' },
              { icon: 'icon-chexiao', content: '撤销(cmd+z/ctrl+z)' },
              {
                icon: 'icon-shuaxin1',
                content: '重做(cmd+shift+z/ctrl+shift+z)',
              },
              { icon: 'icon-wenhao', content: '说明' },
            ]
    }

    if (val.length > 0) {
      const addPicList = [] as Array<any>
      val.forEach(pic => {
        const { name } = pic
        if (!this.picList.find(item => item.name === name)) {
          addPicList.push(pic)
        }
      })

      this.picList = this.picList.concat(addPicList)
    }

    if (this.loadPicNum > 0) {
      this.getPic(this.picList[0])
      this.isShown = false
      this.isAdd = false
    }

    this.addMouseMove()
    // 拖动图片
    this.sortPic()
    // 懒加载
    this.initLazyLoad()
  }
  addImg() {
    this.removeMouseMove()
    this.isShown = true
    this.isAdd = true
  }
  // 重置多边形参数
  initPolygonParams() {
    this.pointArray.map(point => {
      this.canvas.remove(point)
    })
    this.pointArray = []
    this.lineArray.map(line => {
      this.canvas.remove(line)
    })
    this.lineArray = []
    this.canvas.remove(this.activeShape).remove(this.activeLine)
    this.activeShape = null
    this.activeLine = null
    this.polygonMode = false
    this.doDrawing = false
  }
  //0-导入 1-导出 2-移动 3-钢笔 4-矩形 5-清除
  tabClick(tab) {
    this.isExplanation = false
    if (this.canvas.getObjects()[0]) {
      if (tab === 2) {
        this.canvas
          .getObjects()[0]
          .set({ lockMovementX: false, lockMovementY: false })
      } else {
        this.canvas
          .getObjects()[0]
          .set({ lockMovementX: true, lockMovementY: true })
      }
    }
    this.initPolygonParams()
    this.checkedTab = tab
    if (this.checkedTab === 0) this.importData()
    if (this.checkedTab === 1) this.exportData()
    // 多边形特殊处理
    if (this.checkedTab === 3) this.drawPolygon()
    if (this.checkedTab === 5) {
      this.canvas.getObjects().forEach((item, index) => {
        if (index !== 0) this.canvas.remove(item)
      })
    }
    if (this.checkedTab === 6) this.repeatImg()
    if (this.checkedTab === 7) this.undo()
    if (this.checkedTab === 8) this.redo()

    if (this.checkedTab === 9 || (this.checkedTab === 2 && this.type === 0))
      this.isExplanation = true
  }

  //输入框
  importData() {
    this.isImport = true
  }
  // 导出框
  exportData() {
    this.objMap[this.lastName] = this.canvas.getObjects()
    this.labelListMap[this.lastName] = this.currentLabelList

    this.changedPic = []

    this.deepObjMap =
      this.type === 0
        ? _.cloneDeep(this.labelListMap)
        : _.cloneDeep(this.objMap)
    const keys = Object.keys(this.deepObjMap)
    keys.map(key => {
      if (
        (this.type === 0 && this.deepObjMap[key].length === 0) ||
        (this.type === 1 && this.deepObjMap[key].length <= 1)
      ) {
        delete this.deepObjMap[key]
      } else {
        const img = this.picList.find(item => item.name === key)
        getPic(img).then((val: any) => {
          this.changedPic.push(val)
        })
      }
    })
    if (Object.keys(this.deepObjMap).length === 0) {
      this.$SxMessage.error('未标注图片')
    } else {
      this.isExport = true
    }
  }
  // 取消导出
  cancel() {
    this.isExport = false
  }

  isYamlLoaded = false
  isTxtLoaded = false
  //取消导入
  cancelImport() {
    this.isImport = false
  }

  uploadStatus(val) {
    if (val.isTxtLoaded) {
      this.isTxtLoaded = val.isTxtLoaded
    }
    if (val.isYamlLoaded) {
      this.isYamlLoaded = val.isYamlLoaded
    }
  }
  // 导出
  submit(type, rate) {
    this.isExport = false
    switch (type) {
      case 'ImgJson':
        exportImgJson(this.deepObjMap, this.changedPic, rate)
        break
      case 'VOC':
        exportVOC(this.deepObjMap, this.changedPic, rate)
        break
      case 'COCO':
        exportCOCO(this.deepObjMap, this.labelList, this.changedPic, rate)
        break
      case 'RectYOLO':
        exportYOLO(this.deepObjMap, this.labelList, this.changedPic, rate)
        break
      case 'PolyVGG':
        exportVGG(this.deepObjMap, this.picList, this.changedPic, rate)
        break
    }
  }
  // 退出
  exit() {
    location.reload()
    this.objMap = {}
    this.canvas.clear()
    this.isShown = true
    this.picList = []
    this.currentLabelList = []
    this.labelListMap = {}
    //解除快捷键绑定
    this.labelList.forEach((item, index) => {
      hotkeys.unbind((index + 1).toString())
    })
    this.labelList = []
    this.canvas.setViewportTransform([1, 0, 0, 1, 0, 0])
  }

  //切换标签录入的输入框展示
  switchInputLabel() {
    this.inputModalVisiable = !this.inputModalVisiable
    if (this.inputModalVisiable) {
      //禁用快捷键
      hotkeys.setScope('disable')
    } else {
      hotkeys.setScope('enable')
    }
  }

  //drag drop  图片
  sortPic() {
    this.clonePicList = _.cloneDeep(this.picList)
    this.$nextTick(() => {
      const el = document.querySelector('.img__list')
      const sortable = new Sortable(el, {
        animation: 150,
        onEnd: evt => {
          const { oldIndex, newIndex } = evt
          const changedPic = this.clonePicList.splice(oldIndex, 1)[0]
          this.clonePicList.splice(newIndex, 0, changedPic)
        },
      })
    })
  }

  //添加鼠标指针移动监听
  addMouseMove() {
    const box: any = document.querySelector('#tool_content')
    box.addEventListener(
      'mousemove',
      e => {
        const cH = this.$refs['crosshair-h'] as any
        const cV = this.$refs['crosshair-v'] as any

        cH.style.top = `${e.pageY}px`
        cV.style.left = `${e.pageX}px`
      },
      false,
    )
  }

  //取消对鼠标指针的监听
  removeMouseMove() {
    const box: any = document.querySelector('#tool_content')
    box.removeEventListener('mousemove', this.addMouseMove, false)
  }

  mounted() {
    window.onbeforeunload = event => {
      //适配fireFox
      event.preventDefault()

      //适配chrome
      event.returnValue = ''
      return 'message'
    }

    this.canvas = new fabric.Canvas('canvas', {
      preserveObjectStacking: true,
    })
    this.canvas.selectionColor = 'rgba(0,0,0,0.05)'
    //画板铺满
    this.initCanvas()
    //默认光标
    this.canvas.defaultCuror = 'crosshair'
    this.canvas.hoverCursor = 'crosshair'
    this.canvas.moveCursor = 'crosshair'

    // 操作之后记录下来
    this.canvas.on('object:modified', () => {
      this.updateModifications()
    })

    this.canvas.on('mouse:down', this.mousedown)
    this.canvas.on('mouse:move', this.mousemove)
    this.canvas.on('mouse:up', this.mouseup)
    //缩放
    this.canvas.on('mouse:wheel', this.mousewheel)

    this.setShortCuts()

    //图片list scroll监听
    document
      .getElementsByClassName('img__list')[0]
      .addEventListener('scroll', _.debounce(this.initLazyLoad, 1000))

    window.addEventListener('resize', _.debounce(this.initLazyLoad, 1000))
  }

  initLazyLoad() {
    this.$nextTick(() => {
      const imgbox: any = document.getElementsByClassName('img__list')[0]
      const viewPortHeight =
        imgbox.clientHeight + imgbox.getBoundingClientRect().top
      const imgList = document.querySelectorAll('.img__item')
      imgList.forEach(item => {
        const elTop = item.getBoundingClientRect().top

        const img: any = item.childNodes[0].childNodes[0]
        const imgSize: any = item.childNodes[1].childNodes[1]
        const format = imgSize.innerText

        if (viewPortHeight > elTop && elTop > imgbox.clientHeight) {
          if (format === '') {
            const imgName = img.getAttribute('dataSrc')
            const imgFile = this.picList.find(item => item.name === imgName)
            getPic(imgFile).then((val: any) => {
              img.src = val.url
              imgSize.innerText = val.format
            })
          }
        } else {
          img.src = ''
          imgSize.innerText = ''
        }
      })
    })
  }

  updateModifications() {
    // 防止json序列化的时候把自定义属性过滤了
    const myjson = this.canvas.toJSON([
      'selectable',
      'hasBorders',
      'hasControls',
      'hasRotatingPoint',
      'lockMovementX',
      'lockMovementY',
      'curWidth',
      'curHeight',
      'transparentCorners',
      'objectCaching',
      'opacity',
      'lockRotation',
      'name',
    ])
    this.undoStack.push(myjson)
    this.redoStack = []
  }

  initCanvas() {
    const cvsWidth =
      document.getElementsByClassName('tool_content')[0].clientWidth
    const cvsHeight =
      document.getElementsByClassName('tool_content')[0].clientHeight
    this.canvas.setWidth([cvsWidth])
    this.canvas.setHeight([cvsHeight])
  }

  mousewheel(opt) {
    opt.e.preventDefault()
    opt.e.stopPropagation()
    if (opt.e.ctrlKey) {
      const delta = opt.e.deltaY
      let zoom = this.canvas.getZoom()
      zoom *= 0.99 ** delta
      if (zoom < 1) zoom = 1
      if (zoom > 8) zoom = 8
      this.canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom)
      // this.canvas.setZoom(zoom)
    }
  }

  //快捷键设置
  setShortCuts() {
    //切换图片快捷键
    hotkeys(
      'left,right,up,down',
      'enable',
      //   { element: document.getElementById('tool') },
      (event, handler) => {
        event.preventDefault()
        if (this.currentPicName) {
          let currentIndex = this.clonePicList.findIndex(
            item => item?.name === this.currentPicName,
          )
          switch (handler.key) {
            //上一张
            case 'left':
            case 'up':
              currentIndex =
                currentIndex === 0 ? this.loadPicNum - 1 : currentIndex - 1
              break
            //下一张
            case 'right':
            case 'down':
              currentIndex =
                currentIndex === this.loadPicNum - 1 ? 0 : currentIndex + 1
              break
          }
          this.getPic(this.clonePicList[currentIndex])
          // this.loadExpImg(this.clonePicList[currentIndex])
        } else {
          return
        }
      },
    )

    //画图快捷键
    hotkeys(
      'backspace,ctrl+z,command+z,command+shift+z,ctrl+shift+z,p,r,a,d,s,n,c',
      'enable',
      (event, handler) => {
        event.preventDefault()

        switch (handler.key) {
          //撤销
          case 'command+z':
          case 'ctrl+z':
            this.undo()
            break
          //反撤销
          case 'command+shift+z':
          case 'ctrl+shift+z':
            this.redo()
            break
          //钢笔工具
          case 'p':
            this.tabClick(3)
            break
          //矩形工具
          case 'r':
            this.tabClick(4)
            break
          case 's':
            this.tabClick(2)
            break
          //缩放还原
          case 'a':
            this.canvas.setViewportTransform([1, 0, 0, 1, 0, 0])
            break

          //删除选定对象
          case 'backspace':
            this.deleteObj()
            break

          //清除
          case 'n':
            this.tabClick(5)
            break
          //重复
          case 'c':
            this.tabClick(6)
            break
        }
      },
    )

    //开启快捷键 默认开启
    hotkeys.setScope('enable')
  }

  deleteObj() {
    if (
      this.canvas.getActiveObject() &&
      this.canvas.getActiveObject().name !== 'img'
    ) {
      //标签栏同步修改
      const { labelName } = this.canvas.getActiveObject()
      const labelIndex = this.currentLabelList.findIndex(
        e => e.name === labelName,
      )
      if (labelIndex !== -1) {
        this.currentLabelList[labelIndex].count--
        if (this.currentLabelList[labelIndex].count === 0) {
          this.currentLabelList.splice(labelIndex, 1)
        }
      }

      this.canvas.remove(this.canvas.getActiveObject())

      this.updateModifications()
    }
  }

  undo() {
    if (this.undoStack.length > 1) {
      this.canvas.clear().renderAll()
      const nowStack = this.undoStack.pop()
      this.redoStack.push(nowStack)
      this.canvas.loadFromJSON(this.undoStack[this.undoStack.length - 1])
      this.canvas.renderAll()
    }
  }
  redo() {
    if (this.redoStack.length > 0) {
      this.canvas.clear().renderAll()
      this.canvas.loadFromJSON(this.redoStack[this.redoStack.length - 1])
      const lastStack = this.redoStack.pop()
      this.undoStack.push(lastStack)
      this.canvas.renderAll()
    }
  }

  // 鼠标按下时触发
  mousedown(e) {
    // 记录鼠标按下时的坐标
    const xy = this.canvas.getPointer(e.e)
    this.mouseFrom.x = xy.x
    this.mouseFrom.y = xy.y
    this.doDrawing = true
    const activeObj = this.canvas.getActiveObject()
    if (activeObj) {
      switch (activeObj.name) {
        case 'img':
          if (this.checkedTab === 2) this.preventImgFromLeaving(activeObj)
          break
        default:
          // 选中多边形时
          if (activeObj.name === 'polygon') {
            polyEdit(activeObj)
          }
          this.preventRectFromLeaving(activeObj)
          break
      }
    }
    // 绘制多边形
    if (this.checkedTab === 3) {
      // this.canvas.skipTargetFind = false
      try {
        // 此段为判断是否闭合多边形，点击红点时闭合多边形
        if (this.pointArray.length > 1) {
          // e.target.id == this.pointArray[0].id 表示点击了初始红点
          if (e.target && e.target.id == this.pointArray[0].id) {
            this.generatePolygon()
          }
        }
        //未点击红点则继续作画
        if (
          this.polygonMode &&
          (!activeObj ||
            activeObj.name === 'img' ||
            this.pointArray.length !== 0)
        ) {
          this.addPoint(xy)
        }
      } catch (error) {
        console.log(error)
      }
    }
  }
  // 鼠标松开执行
  mouseup(e) {
    const xy = this.canvas.getPointer(e.e)
    this.mouseTo.x = xy.x
    this.mouseTo.y = xy.y
    if (this.drawingObject) {
      this.updateModifications()
      this.canvas.setActiveObject(this.drawingObject)
    }
    this.drawingObject = null
    this.moveCount = 1
    if (this.checkedTab === 2 || this.checkedTab === 4) {
      this.doDrawing = false
      // this.canvas.skipTargetFind = false
    }
    if (this.checkedTab === 3 && !this.polygonMode) {
      this.drawPolygon()
    }
  }
  //鼠标移动过程中已经完成了绘制
  mousemove(e) {
    if (this.moveCount % 2 && !this.doDrawing) {
      //减少绘制频率
      return
    }
    this.moveCount++
    const xy = this.canvas.getPointer(e.e)
    this.mouseTo.x = xy.x
    this.mouseTo.y = xy.y
    // 矩形
    if (this.checkedTab === 4) {
      const active = this.canvas.getActiveObject()
      if (!active || active.name === 'img') {
        this.drawing(e)
      }
    }
    if (this.checkedTab === 3) {
      if (this.activeLine && this.activeLine.class == 'line') {
        const pointer = this.canvas.getPointer(e.e)
        this.activeLine.set({ x2: pointer.x, y2: pointer.y })

        const points = this.activeShape.get('points')
        points[this.pointArray.length] = {
          x: pointer.x,
          y: pointer.y,
          zIndex: 1,
        }
        this.activeShape.set({
          points: points,
        })
        this.canvas.renderAll()
      }
      this.canvas.renderAll()
    }
  }

  // 绘制多边形开始，绘制多边形和其他图形不一样，需要单独处理
  drawPolygon() {
    this.polygonMode = true
    //这里画的多边形，由顶点与线组成
    this.pointArray = new Array() // 顶点集合
    this.lineArray = new Array() //线集合
  }
  addPoint(xy) {
    const random = Math.floor(Math.random() * 10000)
    const id = new Date().getTime() + random
    const circle = new fabric.Circle({
      radius: 4,
      fill: 'rgba(255,255,255,0.5)',
      stroke: '#333333',
      strokeWidth: 0.5,
      left: xy.x,
      top: xy.y,
      selectable: false,
      hasBorders: false,
      originX: 'center',
      originY: 'center',
      id: id,
      objectCaching: false,
    })
    if (this.pointArray.length == 0) {
      circle.set({
        fill: '#ffffff',
      })
    }
    const points = [xy.x, xy.y, xy.x, xy.y]

    this.line = new fabric.Line(points, {
      strokeWidth: 1,
      fill: '#999999',
      stroke: '#999999',
      class: 'line',
      originX: 'center',
      originY: 'center',
      selectable: false,
      hasBorders: false,
      evented: false,
      objectCaching: false,
    })
    if (this.activeShape) {
      const points: any = this.activeShape.get('points')
      points.push({
        x: xy.x,
        y: xy.y,
      })
      const polygon = new fabric.Polygon(points, {
        stroke: '#333333',
        strokeWidth: 1,
        fill: '#cccccc',
        opacity: 0.3,
        selectable: false,
        hasBorders: false,
        evented: false,
        objectCaching: false,
      })
      this.canvas.remove(this.activeShape)
      this.canvas.add(polygon)
      this.activeShape = polygon
      this.canvas.renderAll()
    } else {
      const polyPoint = [
        {
          x: xy.x,
          y: xy.y,
        },
      ]
      const polygon = new fabric.Polygon(polyPoint, {
        stroke: '#333333',
        strokeWidth: 1,
        fill: '#cccccc',
        opacity: 0.3,

        selectable: false,
        hasBorders: false,
        evented: false,
        objectCaching: false,
      })
      this.activeShape = polygon
      this.canvas.add(polygon)
    }
    this.activeLine = this.line

    this.pointArray.push(circle)
    this.lineArray.push(this.line)
    this.canvas.add(this.line)
    this.canvas.add(circle)
  }
  generatePolygon() {
    const points = new Array()
    this.pointArray.map((point, index) => {
      points.push({
        x: point.left,
        y: point.top,
      })
      this.canvas.remove(point)
    })

    this.lineArray.map((line, index) => {
      this.canvas.remove(line)
    })
    this.canvas.remove(this.activeShape).remove(this.activeLine)
    const polygon = new fabric.Polygon(points, {
      stroke: this.color,
      strokeWidth: this.drawWidth,
      fill: 'rgba(255, 255, 255, 0.2)',
      objectCaching: false,
      transparentCorners: false,
      opacity: 0.5,
      cornerStrokeColor: '#000',
      cornerColor: '#fff',
      // hasBorders: false,
      name: 'polygon',
    })
    this.canvas.add(polygon)
    this.activeLine = null
    this.activeShape = null
    this.polygonMode = false
    this.doDrawing = false
    this.drawingObject = polygon
  }
  //绘制矩形
  drawing(e) {
    if (this.drawingObject) {
      this.canvas.remove(this.drawingObject)
    }
    let canvasObject = null,
      left = this.mouseFrom.x,
      top = this.mouseFrom.y,
      mouseFrom = this.mouseFrom,
      mouseTo = this.mouseTo
    //框选方向
    top = Math.min(mouseFrom.y, mouseTo.y)
    left = Math.min(mouseFrom.x, mouseTo.x)
    let width = Math.abs(mouseFrom.x - mouseTo.x)
    let height = Math.abs(mouseFrom.y - mouseTo.y)
    // 按shift时画正方型
    if (e.e.shiftKey) {
      width > height ? (height = width) : (width = height)
    }
    canvasObject = new fabric.Rect({
      top,
      left,
      width,
      height,
      //边框
      stroke: this.color,
      strokeWidth: this.drawWidth,
      //   cornerSize: 20,
      //   cornerStyle: 'circle',
      //控制器样式
      transparentCorners: false,
      cornerStrokeColor: '#000',
      cornerColor: '#fff',
      //填充
      fill: 'rgba(255, 255, 255, 0.2)',
      name: 'rectangle',
      opacity: 0.5,
      lockRotation: true,
      selectionLineWidth: 5,
      selectionDashArray: [5, 5],
    })

    if (canvasObject) {
      this.canvas.add(canvasObject)
      this.drawingObject = canvasObject
    }
  }

  preventImgFromLeaving(active) {
    this.canvas.discardActiveObject()
    active.lockMovementX = false
    active.lockMovementY = false

    let lastLeft = active.left,
      lastTop = active.top

    active.on('moving', evt => {
      active.setCoords()

      let objs = this.canvas.getObjects()
      objs.slice(1).map(item => {
        item.left += active.left - lastLeft
        item.top += active.top - lastTop
        item.setCoords()
      })
      lastLeft = active.left
      lastTop = active.top
    })

    // deactivates all objects on mouseup
    active.on('mouseup', () => {
      active.off('moving')
      this.canvas.discardActiveObject().renderAll()
    })
  }

  preventRectFromLeaving(active) {
    active.on('moving', evt => {
      const obj = active
      const imgObj = this.canvas.getObjects()[0]
      //img的最右端
      const imgR = imgObj.left + imgObj.curWidth
      //最下端
      const imgB = imgObj.top + imgObj.curHeight
      obj.setCoords()
      if (obj.left < imgObj.left) {
        obj.left = imgObj.left
      }
      if (obj.left > imgR - obj.width * obj.scaleX) {
        obj.left = imgR - obj.width * obj.scaleX
      }
      if (obj.top < imgObj.top) {
        obj.top = imgObj.top
      }
      if (obj.top > imgB - obj.height * obj.scaleY) {
        obj.top = imgB - obj.height * obj.scaleY
      }
    })
  }

  setAnnotation(val) {
    if (this.type === 0) {
      //   // todo
      //   console.log('val', val)
      val.forEach(item => {
        const { image, annotations } = item
        const list = [] as Array<any>
        annotations.forEach(anno => {
          const obj = {
            name: anno,
            color: Colors.random(),
          }
          if (!this.labelList.find(i => i.name === anno)) {
            this.labelList.push(obj)
          }

          list.push({
            ...obj,
            count: 1,
          })
        })

        this.labelListMap[image] = list
      })
    } else {
      if (val.imagesData) {
        this.imagesData = this.imagesData.concat(val.imagesData)
      }

      if (val.labelNames) {
        this.labelNames = this.labelNames.concat(val.labelNames)
      }

      //   // todo
      //   console.log('imagesData', this.imagesData)

      //   // todo
      //   console.log('labelNames', this.labelNames)

      this.imagesData.map(item => (item.loadStatus = false))
    }
  }

  confirmImport() {
    const picItem = this.picList.find(
      item => item?.name === this.currentPicName,
    )
    this.labelNames.forEach(labelItem => {
      if (!this.labelList.find(i => i.name === labelItem.name)) {
        this.labelList.push(labelItem)
      }
    })

    // // todo
    // console.log('labelList', this.labelList)

    // this.labelList = this.labelList.concat(this.labelNames)
    this.setLabelsShortCuts()
    this.loadExpImg(picItem)
    this.isImport = false
  }

  saveRepeatState() {
    // 框选的图案
    const objs = _.cloneDeep(this.canvas.getObjects()).slice(1)
    // 获取上次图片
    const oldObj = this.canvas.getObjects()[0]

    if (oldObj) {
      // 将框选的图案添加边距百分比
      objs.map(item => {
        item.leftPercent = (item.left - oldObj.left) / oldObj.width
        item.topPercent = (item.top - oldObj.top) / oldObj.height
        item.labelList = this.currentLabelList
      })
    }
    this.repeatObjs = objs
  }
  repeatImg() {
    // 添加上一次操作的标签列表
    // 获取当前图片
    const obj = this.canvas.getObjects()[0]
    // 根据图片位置重绘上次状态
    if (this.repeatObjs.length > 0) {
      this.repeatObjs.map(item => {
        item.left = obj.left + obj.width * item.leftPercent
        item.top = obj.top + obj.height * item.topPercent
        this.currentLabelList = item.labelList
        this.canvas.add(item)
      })
    }
    this.canvas.renderAll()
  }
}
</script>

<style lang="scss" scoped>
.index {
  display: flex;
  flex-direction: column;
  position: relative;
  height: 100vh;
  &::before {
    content: '';
    display: none;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(34, 34, 34, 0.6);
    z-index: 1;
  }

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
      display: flex;
      height: 100%;
      width: 40px;
      justify-content: center;
      align-items: center;

      &:hover {
        background: #488feb;
        &::after {
          display: flex;
          min-width: 80px;
          justify-content: center;
        }
      }

      &::after {
        content: '退出编辑';
        display: none;
        position: absolute;
        top: 10px;
        right: 45px;
        background: rgba(34, 34, 34, 0.6);
        z-index: 998;
        font-size: 16px;
        font-family: PingFangSC-Regular, PingFang SC;
        color: #fff;
      }
    }
  }
  .tool {
    height: calc(100vh - 40px);
    display: grid;
    position: relative;
    grid-template-columns: get-vw(60px) 1fr get-vw(400px);
    background: #535353;
    flex: 1;
    &_bar {
      .icon {
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        width: get-vw(60px);
        height: get-vw(60px);

        &:hover {
          background: #488feb;
          &::after {
            display: flex;
          }
        }
        &::after {
          content: attr(data-line);
          display: none;
          position: absolute;
          //   top: 0;
          left: 70px;
          background: rgba(34, 34, 34, 0.6);
          z-index: 998;
          font-size: 16px;
          font-family: PingFangSC-Regular, PingFang SC;
          color: #fff;
        }
      }
      .checked {
        background: #488feb;
      }
    }
    &_content {
      display: flex;
      justify-content: center;
      align-items: center;
      background: #282828;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;

      > img {
        display: none;
        position: absolute;
      }
    }

    &_manage {
      height: calc(100vh - 40px);
      .label {
        height: 50%;
        font-size: 12px;
        font-family: PingFangSC-Medium, PingFang SC;
        font-weight: 500;
        color: #ffffff;
        letter-spacing: 1px;
        display: flex;
        flex-direction: column;

        &__main {
          display: flex;
          align-items: center;
          padding: 25px;
          justify-content: space-between;
          position: relative;
        }

        &__btn {
          width: get-v(100px);
          height: 40px;
          padding: 0 10px;
          background: rgba(255, 255, 255, 0);
          border-radius: 2px;
          border: 1px solid #ffffff;
          display: flex;
          justify-content: center;
          align-items: center;
          cursor: pointer;
        }

        &__list {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          max-height: get-vh(150px);
          justify-items: stretch;
          align-items: stretch;
          gap: 10px;
          padding: 20px 20px 0 20px;
          overflow-y: auto;
          margin-bottom: 10px;
        }

        &__item {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 47px;
          border-radius: 2px;
          cursor: pointer;
          position: relative;

          &:hover {
            &::after {
              content: attr(data-sign);
              position: absolute;
              display: flex;
              align-items: center;
              justify-content: center;
              width: 115px;
              //   padding: 0 5px;
              top: -20px;
              background: rgba(34, 34, 34, 0.6);
              z-index: 998;
              font-size: 14px;
              font-family: PingFangSC-Regular, PingFang SC;
              color: #fff;
            }
          }
        }
      }
      .img {
        height: 50%;
        display: flex;
        flex-direction: column;
        font-size: 12px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: #ffffff;
        line-height: 17px;
        letter-spacing: 1px;

        &__list {
          flex: 1;
          overflow-y: scroll;
        }

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

        &__mini {
          width: 54px;
          height: 54px;
          margin-right: 10px;
          display: inline-flex;
          justify-content: center;
          align-items: center;
          img {
            width: auto;
            height: auto;
            max-width: 100%;
            max-height: 100%;
          }
        }

        &__info {
          flex: 1;
          display: flex;
          justify-content: space-between;
        }
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
          font-family: PingFangSC-Medium, PingFang SC;
          font-weight: 500;
          cursor: default;
        }
        .addImg {
          color: #488feb;
          cursor: pointer;
        }
      }
    }
  }
  .sui-icon-normal {
    width: 25px;
    height: 25px;
  }
}

.indexmask {
  &::before {
    display: block;
  }
}

.modal {
  display: flex;
  z-index: 1;

  .ivu-input-wrapper {
    margin: 0 15px;
    width: get-vw(100px);
  }
}

.table {
  flex: 1;
  border-top: 1px solid #454545;
  overflow-y: scroll;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;

  //   padding: ;
  &__item {
    display: flex;
    align-items: center;
    position: relative;
    width: 100%;
    justify-content: space-between;
    margin-bottom: 10px;

    > div {
      display: flex;
      align-items: center;
    }
  }

  &__circle {
    width: 10px;
    height: 10px;
    background: cyan;
    border-radius: 50%;
    margin-right: 10px;
  }

  &__count {
    width: 30px;
    border-radius: 2em;
    display: flex;
    justify-content: center;
    margin-left: 10px;
    opacity: 0.5;
  }
}

.sui-icon-small {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

#crosshair-h {
  width: 100%;
  height: 2px;
  margin-top: 0;
  position: absolute;
  z-index: 6000 !important;
}
#crosshair-v {
  height: 100vh;
  width: 2px;
  margin-left: 0;
  position: fixed;
  top: 0;
  z-index: 6001 !important;
}

.hide-hair {
  display: none;
}
.hair {
  background-color: #fff;
  /*box-shadow:0 0 5px rgba(100,100,100, 0.5);*/
  pointer-events: none;
  //   transition: all 0.05s ease;
  mix-blend-mode: difference;
  opacity: 0.2;
}

#cursor-d {
  position: absolute;
  /*box-shadow:0 0 5px rgba(100,100,100, 0.5);*/
  /*background-color:rgba(113,180,110,0.5); */ /* R: 113 G: 180 B: 110 */
  border: 6px solid rgba(255, 255, 255, 0.1);
  opacity: 1;
  pointer-events: none;
  /*animation: pulse 2s infinite;*/
  width: 20px;
  height: 20px;
  border-radius: 50%;
  z-index: 6002 !important;
  margin-top: -16px;
  margin-left: -16px;
  transition: all 0.05s ease;
  background: #fff;
  mix-blend-mode: difference;
}

#cursor-d.xhover {
  animation: pulse 2s infinite;
  opacity: 1;
  height: 8em;
  width: 8em;
  margin-top: -5em;
  margin-left: -5em;
}
</style>
