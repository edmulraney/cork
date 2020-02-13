import { internal } from './internal.js'

const elementRegex = /(<[^>]+>)/g
const getElements = str => str.split(elementRegex)
const isTextNode = element => element !== null && element.indexOf('<') === -1
const isCloseElement = element => element.indexOf('</') !== -1
const isOpenElement = element => element.indexOf('>') !== -1 && element.indexOf('/>') === -1
const isSelfCloseElement = element => element !== null && element.indexOf('/>') !== -1
const isComponent = element => element !== null && /(<[A-Z])/.test(element)

const getElementName = str => {
  const spaceIndex = str.indexOf(' ')
  const hasSpace = spaceIndex !== -1
  return str.replace(/[><\/]/g, '').substring(0, hasSpace ? spaceIndex - 1 : str.length)
}
const getProp = prop => {
  if (prop.indexOf(`props[`) !== -1) {
    const propIndex = prop.substring(prop.indexOf('[') + 1, prop.indexOf([']']))
    return internal.props[propIndex]
  }
  return prop
}
const getProps = element => {
  const attributes = element.substring(element.indexOf(' ') + 1, element.lastIndexOf('"') + 1)
  const propsArray = attributes.split(/\="([^"]+)"/)
  propsArray.pop() // remove empty last item
  const props = {}
  propsArray.forEach((prop, index) => (index % 2 === 0) && (props[prop.trim()] = getProp(propsArray[index + 1])))
  console.log('getProps', 'created props:', props, 'element:', element)
  return props
}
const createNode = (element, Components) => {
  const props = isTextNode(element) ? ({ nodeValue: element }) : getProps(element)
  console.log('createNode', element, isComponent(element))
  console.log('HERE', element, isComponent(element), Components[getElementName(element)])
  if (isComponent(element) && Components && Components[getElementName(element)]) {
    // return Components[getElementName(element)](props)
    return {
      debug: element,
      type: Components[getElementName(element)],
      props: {
        children: [],
        ...props,
      }
    }
  }

  const node = {
    debug: element,
    type: isTextNode(element) ? 'text' : getElementName(element),
    props: {
      children: [],
      ...props,
    }
  }
  console.log('createNode', {node})
  return node
}

export const createTree = (html) => {
  const elements = getElements(html)
  console.log('createTree', {elements})
  const rootElement = { type: 'root', props: { children: [] } }
  const stack = [rootElement]
  let elementIndex = 0
  let components = null

  const componentsIndex = elements[0].indexOf('__components__[')
  if (componentsIndex !== -1) {
    const id = elements[0].substring(elements[0].indexOf('[') + 1, elements[0].indexOf(']'))
    console.log({ id})
    components = elements[0].components[Number(id)]
    console.log(''.components, {components})
    elements.shift()
  }
  while (elementIndex !== elements.length) {
    let parent = stack[stack.length - 1]
    const element = elements[elementIndex++]
    const isEmptyNode = element.trim() === ''
    if (isEmptyNode) continue

    if (isCloseElement(element)) {
      stack.pop()
      parent = stack[stack.length - 1]
      continue
    }
    
    const node = createNode(element, components)
    
    if (isSelfCloseElement(element) || isTextNode(element)) {
      parent.props.children.push(node)
      continue
    }
    
    if (isOpenElement(element)) {
      parent.props.children.push(node)
      stack.push(node)
      continue
    }
  }

  console.log('createTree', JSON.stringify(stack[0].props.children[0], null, 2))
  return stack[0].props.children[0] // ignore root container
}
