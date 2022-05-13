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
        <canvas
          class="tool__canvas"
          id="canvas"
          :width="width"
          :height="height"
        ></canvas>

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
                  v-if="objMap[item.name] && objMap[item.name].length > 1"
                  type="icon-export"
                />
              </div>
            </li>
          </ul>
        </div>
      </div>
      <SxExport v-show="isExport" @cancel="cancel" @exportData="submit" />
    </div>
    <SxMask
      v-if="isShown"
      @enterEdit="enterEdit"
      :type="type"
      :loadPicNum="loadPicNum"
      :isAdd="isAdd"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { fabric } from 'fabric'
import SxMask from 'components/SxMask.vue'
import SxExport from 'components/SxExport.vue'
import { handlePicName, getRandomColor, getPicResolution } from '../utils/tools'
import hotkeys from 'hotkeys-js'
import { exportVGG } from 'utils/VGGExporter'

@Component({
  components: {
    SxMask,
    SxExport,
  },
})
export default class Index extends Vue {
  icons = [
    'icon-export',
    'icon-icon-',
    'icon-pentoolgangbigongju',
    'icon-huajuxing_0',
  ] as any

  checkedTab = 0
  // 区分分类以及对象识别
  iconShow = false
  isShown = true
  isExport = false
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
  drawWidth = 2 //笔触宽度
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

  get loadPicNum() {
    return this.picList?.length || 0
  }

  handlePicName = handlePicName
  getPicResolution = getPicResolution

  objMap = {} as any

  lastName = ''

  label = ''
  //标签输入框是否可见
  inputModalVisiable = false
  labelList = [] as Array<any>
  hasEditedNum = 0

  get canvasAllObjects() {
    return this.canvas.getObjects()
  }

  getLabel() {
    if (!this.label) return
    if (this.labelList.find(label => label.name === this.label)) {
      this.$SxMessage.error('该标签已添加')
      return
    }
    this.labelList.push({ name: this.label, color: getRandomColor() })
    this.label = ''
  }

  selectLabel(label) {
    const { name, color } = label

    const activeObj = this.canvas.getActiveObject()

    if (activeObj) {
      activeObj.set({
        fill: color,
        labelName: name,
        //   borderColor: color
      })
    }

    this.canvas.renderAll()
  }

  loadExpImg(item) {
    const { url, name } = item
    if (this.lastName) {
      this.objMap[this.lastName] = this.canvas.getObjects()
    }
    this.canvas.clear()
    this.currentPicUrl = url
    if (this.objMap[name]?.length > 0) {
      this.objMap[name].forEach(v => {
        this.canvas.add(v)
      })
    } else {
      fabric.Image.fromURL(this.currentPicUrl, oImg => {
        if (oImg.width > oImg.height) {
          oImg.scaleToWidth(this.width)
          const currentHeight = (this.width * oImg.height) / oImg.width
          oImg.scaleToHeight(currentHeight)
          oImg.set({
            top: (this.height - currentHeight) / 2,
            selectable: false,
            hasControls: false,
          })
        } else {
          oImg.scaleToHeight(this.height)
          const currentWidth = (this.height * oImg.width) / oImg.height
          oImg.scaleToWidth(currentWidth)
          oImg.set({
            left: (this.width - currentWidth) / 2,
            selectable: false,
            hasControls: false,
          })
        }
        this.canvas.add(oImg)
      })
    }
    this.lastName = name
    const editedNames = [] as Array<any>
    for (let key in this.objMap) {
      if (this.objMap[key].length > 1) {
        editedNames.push(key)
      }
    }
    this.hasEditedNum = editedNames.length

    // todo
    console.log('objMap', this.objMap)
  }

  // 0-分类 1-检测
  enterEdit(type, val) {
    this.type = type
    if (type !== 2) {
      this.icons =
        type === 0
          ? ['icon-export']
          : [
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
  // 0-导出 1-移动 2-钢笔 3-矩形
  tabClick(tab) {
    this.initPolygonParams()
    this.checkedTab = tab
    //整个画板元素不可被选中
    this.canvas.skipTargetFind = this.checkedTab === 3
    // 多边形特殊处理
    if (this.checkedTab === 2) this.drawPolygon()
    if (this.checkedTab === 0) this.exportData()
  }
  // 导出框
  exportData() {
    this.isExport = true
  }
  // 取消导出
  cancel() {
    this.isExport = false
  }
  // 导出
  submit(type) {
    this.isExport = false
    const deepObjMap = _.cloneDeep(this.objMap)
    const keys = Object.keys(deepObjMap)
    deepObjMap[this.lastName] = this.canvas.getObjects()
    switch (type) {
      case 'PoloVGG':
        exportVGG(deepObjMap)
        break
    }
  }
  // 退出
  exit() {
    this.canvas.clear()
    this.isShown = true
    this.picList = []
  }

  //切换标签录入的输入框展示
  switchInputLabel() {
    this.inputModalVisiable = !this.inputModalVisiable
  }

  mounted() {
    const doc = document.getElementsByClassName('tool_content')[0]
    const myCanvas: any = document.getElementById('canvas')
    this.width = doc.clientWidth * 0.8
    this.height = doc.clientHeight * 0.8
    myCanvas.width = this.width
    myCanvas.height = this.height
    window.onbeforeunload = event => {
      //适配fireFox
      event.preventDefault()

      //适配chrome
      event.returnValue = 'message'
      return 'message'
    }

    this.canvas = new fabric.Canvas('canvas', {})
    this.canvas.selectionColor = 'rgba(0,0,0,0.05)'
    this.canvas.on('mouse:down', this.mousedown)
    this.canvas.on('mouse:move', this.mousemove)
    this.canvas.on('mouse:up', this.mouseup)
    this.quickCheck()

    hotkeys(
      'left,right,up,down',
      //   { element: document.getElementById('tool') },
      (event, handler) => {
        event.preventDefault()
        if (this.currentPicUrl) {
          let currentIndex = this.picList.findIndex(
            item => item?.url === this.currentPicUrl,
          )
          switch (handler.key) {
            case 'left':
            case 'up':
              currentIndex =
                currentIndex === 0 ? this.loadPicNum - 1 : currentIndex - 1
              break
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
  }

  quickCheck() {
    document.onkeydown = e => {
      // 键盘 delete删除所选元素
      if (e.keyCode === 8) {
        this.deleteObj()
      }
      // command+z 删除最近添加的元素
      if (e.keyCode === 90 && e.metaKey && !e.shiftKey) {
        this.redo.push(
          this.canvas.getObjects()[this.canvas.getObjects().length - 1],
        )
        this.canvas.remove(
          this.canvas.getObjects()[this.canvas.getObjects().length - 1],
        )
      }
      // 还原
      if (e.keyCode === 90 && e.metaKey && e.shiftKey) {
        if (this.redo.length > 0) this.canvas.add(this.redo.pop())
      }
      // P 钢笔工具
      if (e.keyCode === 80) {
        this.tabClick(2)
      }
      // R 矩形框选
      if (e.keyCode === 82) {
        this.tabClick(3)
      }
      // 按下ctrl切换移动图片,bug
      if (e.ctrlKey) {
        this.moveFlag = !this.moveFlag
        if (this.moveFlag) {
          const group = new fabric.Group(this.canvas.getObjects(), {})
          this.canvas.clear().renderAll()
          this.canvas.add(group)
        } else {
          console.log(
            this.canvas.getObjects(),
            this.canvas.getObjects()[0].getObjects(),
          )
          const objs = this.canvas.getObjects()[0].getObjects()
          this.canvas.clear().renderAll()
          objs.forEach(item => {
            this.canvas.add(item)
          })
        }
      }
      if (e.keyCode === 65) {
        this.setZoom(0.1)
      }
      if (e.keyCode === 68) {
        this.setZoom(-0.1)
      }
    }
    window.addEventListener(
      'keydown',
      e => {
        // command+s 导出
        if (e.keyCode === 83 && e.metaKey) {
          e.preventDefault()
          this.tabClick(0)
        }
      },
      false,
    )
  }

  setZoom(zoom) {
    const center = this.canvas.getCenter()
    const newZoom = this.canvas.getZoom() + zoom
    this.canvas.zoomToPoint({ x: center.left, y: center.top }, newZoom)
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
    const xy = e.pointer || this.transformMouse(e.e.offsetX, e.e.offsetY)
    this.mouseFrom.x = xy.x
    this.mouseFrom.y = xy.y
    this.doDrawing = true
    const activeObj = this.canvas.getActiveObject()

    if (activeObj) {
      let points = [] as any
      switch (activeObj.name) {
        case 'rectangle':
          // 按顺序
          points.push([activeObj.aCoords.tl.x, activeObj.aCoords.tl.y])
          points.push([activeObj.aCoords.tr.x, activeObj.aCoords.tr.y])
          points.push([activeObj.aCoords.br.x, activeObj.aCoords.br.y])
          points.push([activeObj.aCoords.bl.x, activeObj.aCoords.bl.y])
          break
        case 'polygon':
          // 选中时
          if (this.checkedTab === 1) this.polygonEdit(activeObj)
          activeObj.points.map(item => {
            points.push([item.x, item.y])
          })
          break
      }
      console.log('点位坐标', points)
    }
    // 绘制多边形
    if (this.checkedTab === 2) {
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
          this.addPoint(e)
        }
      } catch (error) {
        console.log(error)
      }
    }
  }
  // 鼠标松开执行
  mouseup(e) {
    const xy = e.pointer || this.transformMouse(e.e.offsetX, e.e.offsetY)
    this.mouseTo.x = xy.x
    this.mouseTo.y = xy.y
    this.drawingObject = null
    this.moveCount = 1
    if (this.checkedTab !== 2 && this.checkedTab !== 0) {
      this.doDrawing = false
      this.checkedTab = 1
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
    const xy = e.pointer || this.transformMouse(e.e.offsetX, e.e.offsetY)
    this.mouseTo.x = xy.x
    this.mouseTo.y = xy.y
    // 矩形
    if (this.checkedTab === 3) {
      this.drawing(e)
    }
    if (this.checkedTab === 2) {
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
  transformMouse(mouseX, mouseY) {
    return { x: mouseX / 1, y: mouseY / 1 }
  }

  // 绘制多边形开始，绘制多边形和其他图形不一样，需要单独处理
  drawPolygon() {
    this.polygonMode = true
    //这里画的多边形，由顶点与线组成
    this.pointArray = new Array() // 顶点集合
    this.lineArray = new Array() //线集合
    this.canvas.isDrawingMode = false
  }
  addPoint(e) {
    const random = Math.floor(Math.random() * 10000)
    const id = new Date().getTime() + random
    const circle = new fabric.Circle({
      radius: 5,
      fill: 'rgba(255,255,255,0.5)',
      stroke: '#333333',
      strokeWidth: 0.5,
      left: (e.pointer.x || e.e.layerX) / this.canvas.getZoom(),
      top: (e.pointer.y || e.e.layerY) / this.canvas.getZoom(),
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
    const points = [
      (e.pointer.x || e.e.layerX) / this.canvas.getZoom(),
      (e.pointer.y || e.e.layerY) / this.canvas.getZoom(),
      (e.pointer.x || e.e.layerX) / this.canvas.getZoom(),
      (e.pointer.y || e.e.layerY) / this.canvas.getZoom(),
    ]

    this.line = new fabric.Line(points, {
      strokeWidth: 2,
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
      const pos = this.canvas.getPointer(e.e)
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
          x: (e.pointer.x || e.e.layerX) / this.canvas.getZoom(),
          y: (e.pointer.y || e.e.layerY) / this.canvas.getZoom(),
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
    this.checkedTab = 1
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

  polygonEdit(poly) {
    const lastControl = poly.points.length - 1
    poly.cornerStyle = 'circle'
    poly.cornerColor = 'rgba(255,255,255,1)'
    poly.controls = poly.points.reduce((acc, point, index) => {
      acc['p' + index] = new fabric.Control({
        positionHandler: (dim, finalMatrix, fabricObject) => {
          const x = fabricObject.points[index].x - fabricObject.pathOffset.x
          const y = fabricObject.points[index].y - fabricObject.pathOffset.y
          return fabric.util.transformPoint(
            { x: x, y: y },
            fabric.util.multiplyTransformMatrices(
              fabricObject.canvas.viewportTransform,
              fabricObject.calcTransformMatrix(),
            ),
          )
        },
        actionHandler: this.anchorWrapper(
          index > 0 ? index - 1 : lastControl,
          this.actionHandler,
        ),
        actionName: 'modifyPolygon',
        pointIndex: index,
      })
      return acc
    }, {})
  }
  getObjectSizeWithStroke(object) {
    const stroke = new fabric.Point(
      object.strokeUniform ? 1 / object.scaleX : 1,
      object.strokeUniform ? 1 / object.scaleY : 1,
    ).multiply(object.strokeWidth)
    return new fabric.Point(object.width + stroke.x, object.height + stroke.y)
  }
  actionHandler(eventData, transform, x, y) {
    const polygon = transform.target
    const currentControl = polygon.controls[polygon.__corner]
    const mouseLocalPosition = polygon.toLocalPoint(
      new fabric.Point(x, y),
      'center',
      'center',
    )
    const polygonBaseSize = this.getObjectSizeWithStroke(polygon)
    const size = polygon._getTransformedDimensions(0, 0)
    const finalPointPosition = {
      x:
        (mouseLocalPosition.x * polygonBaseSize.x) / size.x +
        polygon.pathOffset.x,
      y:
        (mouseLocalPosition.y * polygonBaseSize.y) / size.y +
        polygon.pathOffset.y,
    }
    polygon.points[currentControl.pointIndex] = finalPointPosition
    return true
  }
  anchorWrapper(anchorIndex, fn) {
    return (eventData, transform, x, y) => {
      const fabricObject = transform.target
      const absolutePoint = fabric.util.transformPoint(
        {
          x: fabricObject.points[anchorIndex].x - fabricObject.pathOffset.x,
          y: fabricObject.points[anchorIndex].y - fabricObject.pathOffset.y,
        },
        fabricObject.calcTransformMatrix(),
      )
      const actionPerformed = fn(eventData, transform, x, y)
      const newDim = fabricObject._setPositionDimensions({})
      const polygonBaseSize = this.getObjectSizeWithStroke(fabricObject)
      const newX =
        (fabricObject.points[anchorIndex].x - fabricObject.pathOffset.x) /
        polygonBaseSize.x
      const newY =
        (fabricObject.points[anchorIndex].y - fabricObject.pathOffset.y) /
        polygonBaseSize.y
      fabricObject.setPositionByOrigin(absolutePoint, newX + 0.5, newY + 0.5)
      return actionPerformed
    }
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
      .label {
        height: get-vh(450px);
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
          width: get-vw(100px);
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
          min-height: 30px;
          justify-items: stretch;
          align-items: stretch;
          gap: 10px;
          flex: 1;
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
        height: get-vh(560px);
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
</style>
