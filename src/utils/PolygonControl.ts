import { fabric } from 'fabric'
export const polyEdit = poly => {
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
            fabricObject.canvas?.viewportTransform,
            fabricObject.calcTransformMatrix()
          )
        )
      },
      actionHandler: anchorWrapper(
        index > 0 ? index - 1 : lastControl,
        actionHandler
      ),
      actionName: 'modifyPolygon',
      pointIndex: index,
    })
    return acc
  }, {})
}
const getObjectSizeWithStroke = object => {
  const stroke = new fabric.Point(
    object.strokeUniform ? 1 / object.scaleX : 1,
    object.strokeUniform ? 1 / object.scaleY : 1
  ).multiply(object.strokeWidth)
  return new fabric.Point(object.width + stroke.x, object.height + stroke.y)
}
const actionHandler = (eventData, transform, x, y) => {
  const polygon = transform.target
  const currentControl = polygon.controls[polygon.__corner]
  const mouseLocalPosition = polygon.toLocalPoint(
    new fabric.Point(x, y),
    'center',
    'center'
  )
  const polygonBaseSize = getObjectSizeWithStroke(polygon)
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
const anchorWrapper = (anchorIndex, fn) => {
  return (eventData, transform, x, y) => {
    const fabricObject = transform.target
    const absolutePoint = fabric.util.transformPoint(
      {
        x: fabricObject.points[anchorIndex].x - fabricObject.pathOffset.x,
        y: fabricObject.points[anchorIndex].y - fabricObject.pathOffset.y,
      },
      fabricObject.calcTransformMatrix()
    )
    const actionPerformed = fn(eventData, transform, x, y)
    const newDim = fabricObject._setPositionDimensions({})
    const polygonBaseSize = getObjectSizeWithStroke(fabricObject)
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
