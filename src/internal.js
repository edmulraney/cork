const props = {}
let propIndex = 0

const addProp = prop => {
  props[++propIndex] = prop
  return propIndex
}
window.props = props
export const internal  = {
  addProp,
  props,
  propIndex,
}