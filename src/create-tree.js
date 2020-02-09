const elementRegex = /(<[^>]+>)/g
const getElements = str => str.split(elementRegex)
const isTextNode = element => element !== null && element.indexOf('<') === -1
const isCloseElement = element => element.indexOf('</') !== -1
const isOpenElement = element => element.indexOf('>') !== -1 && element.indexOf('/>') === -1
const isSelfCloseElement = element => element !== null && element.indexOf('/>') !== -1
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
export const createTree = html => {
  const elements = getElements(html)
  const rootElement = { type: 'root', props: {}, children: [] }
  const stack = [rootElement]
  let elementIndex = 0
  
  while (elementIndex !== elements.length) {
    let parent = stack[stack.length - 1]
    const element = elements[elementIndex++]
    const isEmptyNode = element.trim() === ''
    if (isEmptyNode) continue

    const node = {
      type: isTextNode(element) ? 'text' : getElementName(element),
      children: [],
      props: isTextNode(element) ? ({ nodeValue: element }) : getProps(element),
    }    
    
    if (isSelfCloseElement(element) || isTextNode(element)) {
      parent.children.push(node)
      continue
    }
    
    if (isCloseElement(element)) {
      stack.pop()
      parent = stack[stack.length - 1]
      continue
    }
    
    if (isOpenElement(element)) {
      parent.children.push(node)
      stack.push(node)
      continue
    }
    
    
  }  
  console.log(JSON.stringify(stack[0], null, 2))
  return stack[0].children[0] // ignore root container
}

createTree('<div><h1>hello<b>a</b></h1></div>')
