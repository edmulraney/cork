const htmlRegex = /(<[^>]+>|">)/
const getHtml = str => str.split(htmlRegex).filter(x => x.trim() !== '')
const isTextNode = html => html.indexOf('="') === -1 && html.indexOf('<') === -1 && html.indexOf('>') === -1
const isCloseElement = element => element.indexOf('</') !== -1
const isOpenElement = element => element.indexOf('<') !== -1 && element.indexOf('/>') === -1 && element.indexOf('</') === -1
const isSelfCloseElement = element => element.indexOf('/>') !== -1
const hasProp = html => html.indexOf('="') !== -1 

const isComponent = element => /(<[A-Z])/.test(element)
const getElementName = str => {
  const spaceIndex = str.indexOf(' ')
  const hasSpace = spaceIndex !== -1
  return str.replace(/[><\/]/g, '').substring(0, hasSpace ? spaceIndex - 1 : str.length)
}

const getProps = (html, dynamicPropValue) => {
  const attributes = html.substring(html.indexOf(' ') + 1, html.lastIndexOf('"') + 1)
  const propsArray = attributes.split(/="([^"]+|$)"? ?/)
  propsArray.pop()
  propsArray.pop() // remove empty last two items due to regex?
  const props = {}
  for (let propsIndex = 0; propsIndex < propsArray.length; propsIndex += 2) {
    const prop = propsArray[propsIndex]
    const isLastProp = propsIndex === propsArray.length - 1
      props[prop] = isLastProp
        ? props[prop] = dynamicPropValue
        : propsArray[propsIndex + 1]
  }
  return props
}

const createNode = (element, Components) => {
  const props = isTextNode(element) ? ({ nodeValue: element }) : getProps(element)
  if (isComponent(element) && Components && Components[getElementName(element)]) {
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
  return node
}

const hasDynamicChildren = part => Array.isArray(part) && part[0].type !== undefined

const createTree = fragment => {
  const rootElement = { type: 'root', props: { children: [] } }
  const stack = [rootElement]
  fragment.statics.forEach((staticPart, index) => {
    let dynamicPart = fragment.dynamics[index]
    const html = getHtml(staticPart)
    let htmlIndex = 0
    while (htmlIndex < html.length) {
      const htmlPart = html[htmlIndex++]
      let parent = stack[stack.length - 1]
      const isLastElement = htmlIndex === html.length
      const isDynamicTextNode = typeof dynamicPart === 'string' || typeof dynamicPart === 'number'

      let node
      if (isCloseElement(htmlPart)) {
        stack.pop()
        parent = stack[stack.length - 1]
      }
      else if (isSelfCloseElement(htmlPart) || isTextNode(htmlPart)) {
        node = createNode(htmlPart, fragment.components)
        parent.props.children.push(node)
      }
      else if (isOpenElement(htmlPart)) {
        node = createNode(htmlPart, fragment.components)
        parent.props.children.push(node)
        stack.push(node)
      }

      if (hasProp(htmlPart)) {
        const props = getProps(htmlPart, dynamicPart)
        if (node) {
          node.props = {
            ...node.props,
            ...props,
          }
        } else {
          parent.props = {
            ...parent.props,
            ...props,
          }
        }
      }
      else if (isLastElement && dynamicPart !== undefined && hasDynamicChildren(dynamicPart)) {
        dynamicPart.forEach(part => {
          if (part.type === 'fragment') { // our part could be fragment or it could be a tree... (reconciliation)
            node.props.children.push(createTree(part))
          }
          else { // our part could be fragment or it could be a tree... (reconciliation)
            node.props.children.push(part)
          }
        })
      }
      else if (isLastElement && isDynamicTextNode) {
        html.splice(htmlIndex, 0, String(dynamicPart)) // insert it as next htmlPart to process
        dynamicPart = undefined // reset dynamicPart as we're about to process it as the next htmlPart
      }
    }
  })
  return stack[0].props.children[0]
}

export {
  createTree,
}