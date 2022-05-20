<template>
  <div class="index" :class="inputModalVisiable ? 'indexmask' : ''">
    <div class="header">
      <p>
        正在进行的任务<span>{{ hasEditedNum }}</span
        >{{ `/${loadPicNum && !isShown ? loadPicNum : 0}` }}
      </p>
      <sx-icon class="exit" type="icon-tuichu" @click="exit" />
    </div>
    <div id="tool" class="tool">
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
      <div class="tool_content">
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
              v-for="item in labelList"
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
                  @click="delLabel(i)"
                />
                <span class="table__count">{{ label.count }}</span>
              </div>
            </li>
          </ul>
        </div>

        <div class="img">
          <div class="nav">
            <span>图片管理</span>
            <span class="addImg" @click="addImg">继续添加</span>
          </div>

          <ul class="img__list" v-if="!isShown && picList.length > 0">
            <li
              class="img__item"
              v-for="(item, index) in picList"
              :key="index"
              :class="currentPicUrl === item.url ? 'img-active' : ''"
              @click="loadExpImg(item)"
            >
              <div
                class="img__background"
                :style="{ backgroundImage: `url(${item.url})` }"
              ></div>
              <div class="img__info">
                <p class="img__name" :title="item.name">
                  {{ handlePicName(item.name, 5) }}
                </p>
                <p>{{ getPicResolution(item.url) }}</p>
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
      <SxExport
        v-if="isExport"
        :type="type"
        @cancel="cancel"
        @exportData="submit"
      />
    </div>
    <SxMask
      v-if="isShown"
      @enterEdit="enterEdit"
      :type="type"
      :loadPicNum="loadPicNum"
      :isAdd="isAdd"
    />

    <SxImport
      v-if="isImport"
      :type="type"
      @cancelImport="cancelImport"
      @importData="confirmImport"
      @setAnnotation="setAnnotation"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import SxMask from 'components/SxMask.vue'
import SxExport from 'components/SxExport.vue'
import {
  handlePicName,
  getRandomColor,
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

@Component({
  components: {
    SxMask,
    SxExport,
    SxImport,
  },
})
export default class Index extends Vue {
  icons = [] as any

  checkedTab = 0
  // 区分分类以及对象识别
  iconShow = false
  isShown = true
  isExport = false
  isImport = false

  // 区分添加还是初始化
  isAdd = false
  //存储编辑模式
  type = 0

  picList = [] as Array<any>

  canvas = {} as any
  // 回退
  redo = [] as any
  x = ''
  y = ''

  mouseFrom = {} as any
  mouseTo = {} as any
  canvasObjectIndex = 0
  rectangleLabel = 'warning'
  drawWidth = 1 //笔触宽度
  color = '#e2e2e2' //画笔颜色
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

  width = 800
  height = 600

  // 标识移动图片还是框
  moveFlag = false

  currentPicUrl = ''

  imagesData = [] as Array<any>
  labelNames = [] as Array<any>

  get loadPicNum() {
    return this.picList?.length || 0
  }

  handlePicName = handlePicName
  getPicResolution = getPicResolution

  objMap = {} as any

  //存储队列中每张图片的label表格数据
  labelListMap = {} as any

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
    this.labelList.push({ name: this.label, color: getRandomColor() })
    this.label = ''
    //设置label快捷键
    this.setLabelShortCuts()
  }

  //设置label快捷键
  setLabelShortCuts() {
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
      if (activeObj) {
        activeObj.set({
          fill: newColor,
          labelName: newName,
          //   borderColor: color
        })

        this.canvas.renderAll()
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

  loadExpImg(item) {
    const { url, name } = item

    if (this.lastName) {
      this.objMap[this.lastName] = this.canvas.getObjects()
      this.labelListMap[this.lastName] = this.currentLabelList
    }
    this.canvas.clear()

    this.currentPicUrl = url

    this.addImgToCanvas(url, name).then(() => {
      //!判断是否导入过注解框
      const imgData = this.imagesData.find(img => img.fileData.name === name)

      if (imgData && !imgData.loadStatus) {
        const { labelRects } = imgData
        labelRects.forEach(rectItem => {
          const { labelId, rect } = rectItem
          const { name, color } = this.labelNames.find(
            label => label.id === labelId,
          )

          //   // todo
          //   console.log('rect', rect)

          const rectangle = new fabric.Rect({
            width: rect.width,
            height: rect.height,
            fill: color,
            left: rect.x,
            top: rect.y,
            labelName: name,
            // stroke:'green',
            // strokeWidth:3,
            //   centeredRotation: true,
          })
          this.canvas.add(rectangle)
          imgData.loadStatus = true
        })
      }
      if (this.type === 0) {
        this.canvas.setActiveObject(this.canvas.getObjects()[0])
        this.canvas
          .getActiveObject()
          .set({ lockMovementX: true, lockMovementY: true, hasBorders: false })
      }
    })

    // // todo
    // console.log('objMap', this.objMap)

    //判断。重现label列表数据
    if (this.labelListMap[name]) {
      this.currentLabelList = this.labelListMap[name]
    } else {
      this.currentLabelList = []
    }

    this.lastName = name
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

    this.hasEditedNum = count
  }

  //将图片加载到画布中
  addImgToCanvas(url, name) {
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
            const currentWidth = (this.height * oImg.width) / oImg.height
            oImg.scaleToWidth(currentWidth)

            if (currentWidth > this.width) {
              oImg.scaleToWidth(this.width)
              const currentHeight = (this.width * oImg.height) / oImg.width
              oImg.scaleToHeight(currentHeight)
              oImg.set({
                id: 'img',
                top: (this.height - currentHeight) / 2,
                selectable: true,
                hasBorders: false,
                hasControls: false,
                hasRotatingPoint: false,
              })
            } else {
              oImg.set({
                id: 'img',
                left: (this.width - currentWidth) / 2,
                selectable: true,
                hasBorders: false,
                hasControls: false,
                hasRotatingPoint: false,
              })
            }

            this.canvas.add(oImg)

            resolve('')
          })
        }
      },
    )
  }

  setImgObj(url) {
    fabric.Image.fromURL(url, oImg => {
      oImg.scaleToHeight(this.height)
      const currentWidth = (this.height * oImg.width) / oImg.height
      oImg.scaleToWidth(currentWidth)

      if (currentWidth > this.width) {
        oImg.scaleToWidth(this.width)
        const currentHeight = (this.width * oImg.height) / oImg.width
        oImg.scaleToHeight(currentHeight)
        oImg.set({
          id: 'img',
          top: (this.height - currentHeight) / 2,
          selectable: true,
          hasBorders: false,
          hasControls: false,
          hasRotatingPoint: false,
        })
      } else {
        oImg.set({
          id: 'img',
          left: (this.width - currentWidth) / 2,
          selectable: true,
          hasBorders: false,
          hasControls: false,
          hasRotatingPoint: false,
        })
      }

      return oImg
    })
  }

  // 0-分类 1-检测
  enterEdit(type, val) {
    this.type = type
    if (type !== 2) {
      this.icons =
        type === 0
          ? ['icon-wenjiandaoru', 'icon-export']
          : [
              'icon-wenjiandaoru',
              'icon-export',
              'icon-icon-',
              'icon-pentoolgangbigongju',
              'icon-huajuxing_0',
            ]
    }
    const addPicList = [] as Array<any>
    if (val.length > 0) {
      val.forEach(pic => {
        const { name } = pic
        if (!this.picList.find(item => item.name === name)) {
          addPicList.push(pic)
        }
      })
    }

    this.picList = [...this.picList, ...addPicList]

    if (this.loadPicNum > 0) {
      this.isShown = false
      this.isAdd = false
      this.loadExpImg(this.picList[0])
    }
  }
  addImg() {
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
  //0-导入 1-导出 2-移动 3-钢笔 4-矩形
  tabClick(tab) {
    this.initPolygonParams()
    this.checkedTab = tab
    //整个画板元素不可被选中
    this.canvas.skipTargetFind = this.checkedTab === 4
    // 多边形特殊处理
    if (this.checkedTab === 3) this.drawPolygon()
    if (this.checkedTab === 0) this.importData()
    if (this.checkedTab === 1) this.exportData()
  }

  //输入框
  importData() {
    this.isImport = true
  }
  // 导出框
  exportData() {
    this.isExport = true
  }
  // 取消导出
  cancel() {
    this.isExport = false
  }
  //取消导入
  cancelImport() {
    this.isImport = false
  }
  // 导出
  submit(type) {
    this.isExport = false
    const deepObjMap = _.cloneDeep(this.objMap)
    deepObjMap[this.lastName] = this.canvas.getObjects()
    // todo
    console.log('deepObjMap', deepObjMap)

    switch (type) {
      case 'ImgJson':
        exportImgJson(deepObjMap)
        break
      case 'RectVOC':
        exportVOC(deepObjMap, this.width, this.height)
        break
      case 'RectCOCO':
        exportCOCO(
          'rectangle',
          deepObjMap,
          this.labelList,
          this.width,
          this.height,
        )
        break
      case 'RectYOLO':
        exportYOLO(deepObjMap, this.labelList, this.width, this.height)
        break
      case 'PolyCOCO':
        exportCOCO(
          'polygon',
          deepObjMap,
          this.labelList,
          this.width,
          this.height,
        )
        break
      case 'PolyVGG':
        exportVGG(deepObjMap, this.picList, this.width, this.height)
        break
    }
  }
  // 退出
  exit() {
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

  mounted() {
    window.onbeforeunload = event => {
      //适配fireFox
      event.preventDefault()

      //适配chrome
      event.returnValue = 'message'
      return 'message'
    }

    this.canvas = new fabric.Canvas('canvas', {
      preserveObjectStacking: true,
    })
    this.canvas.selectionColor = 'rgba(0,0,0,0.05)'
    this.canvas.on('mouse:down', this.mousedown)
    this.canvas.on('mouse:move', this.mousemove)
    this.canvas.on('mouse:up', this.mouseup)
    //缩放
    this.canvas.on('mouse:wheel', this.mousewheel)

    this.setShortCuts()
  }

  mousewheel(opt) {
    const delta = opt.e.deltaY
    let zoom = this.canvas.getZoom()
    zoom *= 0.99 ** delta
    if (zoom < 1) zoom = 1
    if (zoom > 10) zoom = 20
    this.canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom)
    opt.e.preventDefault()
    opt.e.stopPropagation()
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
        if (this.currentPicUrl) {
          let currentIndex = this.picList.findIndex(
            item => item?.url === this.currentPicUrl,
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
          this.loadExpImg(this.picList[currentIndex])
        } else {
          return
        }
      },
    )

    //画图快捷键
    hotkeys(
      'backspace,command+z,command+shift+z,p,r,a,d,s',
      'enable',
      (event, handler) => {
        event.preventDefault()

        switch (handler.key) {
          //撤销
          case 'command+z':
            this.redo.push(
              this.canvas.getObjects()[this.canvas.getObjects().length - 1],
            )
            this.canvas.remove(
              this.canvas.getObjects()[this.canvas.getObjects().length - 1],
            )
            break
          //反撤销
          case 'command+shift+z':
            if (this.redo.length > 0) this.canvas.add(this.redo.pop())
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
        }
      },
    )

    //禁用快捷键
    // hotkeys(shortCuts, 'disable', (event, handler) => {
    //   event.preventDefault()
    // })
    //开启快捷键 默认开启
    hotkeys.setScope('enable')
  }

  deleteObj() {
    this.canvas.getActiveObjects().map(item => {
      this.redo.push(item)
      this.canvas.remove(item)
    })
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
      switch (activeObj.id) {
        case 'img':
          this.preventImgFromLeaving(activeObj, e)
          break
        default:
          // 选中多边形时
          if (this.checkedTab === 1 && activeObj.name === 'polygon')
            polyEdit(activeObj)
          break
      }
    }
    // 绘制多边形
    if (this.checkedTab === 3) {
      this.canvas.skipTargetFind = false
      try {
        // 此段为判断是否闭合多边形，点击红点时闭合多边形
        if (this.pointArray.length > 1) {
          // e.target.id == this.pointArray[0].id 表示点击了初始红点
          if (e.target && e.target.id == this.pointArray[0].id) {
            this.generatePolygon()
          }
        }
        //未点击红点则继续作画
        if (this.polygonMode) {
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
    if (this.drawingObject) this.canvas.setActiveObject(this.drawingObject)
    this.drawingObject = null
    this.moveCount = 1
    if (this.checkedTab === 2 || this.checkedTab === 4) {
      this.doDrawing = false
      this.checkedTab = 2
      this.canvas.skipTargetFind = false
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
      this.drawing(e)
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
    this.canvas.isDrawingMode = false
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
      const pos = xy
      const points: any = this.activeShape.get('points')
      points.push({
        x: pos.x,
        y: pos.y,
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
      name: 'polygon',
    })
    this.canvas.add(polygon)
    this.activeLine = null
    this.activeShape = null
    this.polygonMode = false
    this.doDrawing = false
    this.checkedTab = 2
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
      //填充
      fill: 'rgba(255, 255, 255, 0.2)',
      name: 'rectangle',
    })

    if (canvasObject) {
      this.canvas.add(canvasObject)
      this.drawingObject = canvasObject
    }
  }

  setAnnotation(val) {
    this.imagesData = val.imagesData
    this.labelNames = val.labelNames
  }

  confirmImport() {
    // // todo
    // console.log('imagesData', this.imagesData)

    // // todo
    // console.log('labelNames', this.labelNames)

    const picItem = this.picList.find(item => item?.url === this.currentPicUrl)
    this.loadExpImg(picItem)
    // this.picList.forEach(pic => {
    //   this.loadExpImg(pic)
    // })
    // // todo
    // console.log('picItem', picItem)

    this.isImport = false
  }
  preventImgFromLeaving(active, evt) {
    this.canvas.discardActiveObject()
    active.lockMovementX = false
    active.lockMovementY = false

    let lastLeft = active.left,
      lastTop = active.top

    active.on('moving', evt => {
      active.setCoords()
      // SET BOUNDING RECT TO 'active'
      const boundingRect = active.getBoundingRect()
      const zoom = this.canvas.getZoom()
      const viewportMatrix = this.canvas.viewportTransform
      // scales bounding rect when zoomed
      boundingRect.top = (boundingRect.top - viewportMatrix[5]) / zoom
      boundingRect.left = (boundingRect.left - viewportMatrix[4]) / zoom
      boundingRect.width /= zoom
      boundingRect.height /= zoom

      const canvasHeight = this.canvas.height / zoom,
        canvasWidth = this.canvas.width / zoom,
        rTop = boundingRect.top + boundingRect.height,
        rLeft = boundingRect.left + boundingRect.width

      // checks top left

      if (rTop < canvasHeight || rLeft < canvasWidth) {
        active.top = Math.max(active.top, canvasHeight - boundingRect.height)
        active.left = Math.max(active.left, canvasWidth - boundingRect.width)
      }

      // checks bottom right

      if (rTop > 0 || rLeft > 0) {
        active.top = Math.min(
          active.top,
          this.canvas.height -
            boundingRect.height +
            active.top -
            boundingRect.top,
        )
        active.left = Math.min(
          active.left,
          this.canvas.width -
            boundingRect.width +
            active.left -
            boundingRect.left,
        )
      }

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
    }
  }
  .tool {
    height: calc(100vh - 40px);
    display: grid;
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
          padding: 10px;
          justify-content: space-between;
          position: relative;
        }

        &__btn {
          width: get-v(100px);
          height: 40px;
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
    background: #ccc;
    display: flex;
    justify-content: center;
    margin-left: 10px;
  }
}

.sui-icon-small {
  width: 20px;
  height: 20px;
  cursor: pointer;
}
</style>
