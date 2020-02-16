import { createTree } from './create-tree.js'

const reconcile = root => {
  const type = root.type
  if (Array.isArray(root)) {
    return root.map((child) = reconcile(child))
  }
  const nextRoot = typeof type === 'string' ? root : createTree(type(root.props))
  if (nextRoot.props && nextRoot.props.children) {
    nextRoot.props.children.forEach((child, idx) => {
      nextRoot.props.children[idx] = reconcile(nextRoot.props.children[idx])
    })
  }
  return nextRoot
}

const createDom = root => {
  const domElement =
    root.type == 'text'
      ? document.createTextNode('')
      : document.createElement(root.type)
  
  root.ref = domElement

  const isEvent = key => key.startsWith('on')
  const isProp = key => key !== 'children' && !isEvent(key)
  const props = Object.keys(root.props).filter(isProp)
  props.forEach(prop => domElement[prop] = root.props[prop])

  const events = Object.keys(root.props).filter(isEvent)
  events.forEach(evt => {
    const type = evt.toLowerCase().substring(2)
    console.log('event', evt, root.props[evt])
    domElement.addEventListener(type, root.props[evt])
  })

  root.props.children.forEach(child => domElement.appendChild(createDom(child, domElement)))
  console.log({domElement})
  return domElement
}

const render = (fragment, container) => {
  const root = reconcile(createTree(fragment))
  console.log('render', {root})
  const dom = createDom(root)
  container.appendChild(dom)
}

export {
  render,
}