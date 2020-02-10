const elementRegex = /(<[^>]+>)/g
const getElements = str => str.split(elementRegex)
const isTextNode = element => element !== null && element.indexOf('<') === -1
const isCloseElement = element => element.indexOf('</') !== -1
const isOpenElement = element => element.indexOf('>') !== -1 && element.indexOf('/>') === -1
const isSelfCloseElement = element => element !== null && element.indexOf('/>') !== -1
const isOpenComponent = element => element !== null && /(<[A-Z])/.test(element) && element.indexOf('/>') === -1

const getElementName = str => {
  const spaceIndex = str.indexOf(' ')
  const hasSpace = spaceIndex !== -1
  return str.replace(/[><\/]/g, '').substring(0, hasSpace ? spaceIndex - 1 : str.length)
}
const getProps = element => {
  const attributes = element.substring(element.indexOf(' ') + 1, element.lastIndexOf('"') + 1)
  const propsArray = attributes.split(/\="([^"]+)"/)
  propsArray.pop() // remove empty last item
  const props = {}
  propsArray.forEach((prop, index) => (index % 2 === 0) && (props[prop.trim()] = getProp(propsArray[index + 1])))
  return props
}
const createNode = (element, Components) => {
  const props = isTextNode(element) ? ({ nodeValue: element })  : getProps(element)
  if (isOpenComponent(element)) {
    return Components[getElementName(element)](props)
  }

  const node = {
    debug: element,
    type: isTextNode(element) ? 'text' : getElementName(element),
    props: {
      children: [],
      ...props,
    }
  }
  return node
}
export const createTree = (html, Components) => {
  const elements = getElements(html)
  const rootElement = { type: 'root', props: { children: [] } }
  const stack = [rootElement]
  let elementIndex = 0
  
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

    const node = createNode(element, Components)
    
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
  console.log(JSON.stringify(stack[0], null, 2))
  return stack[0].props.children[0] // ignore root container
}

