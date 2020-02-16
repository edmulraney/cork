const htmlRegex = /(<[^>]+>|">)/
const getHtml = str => str.split(htmlRegex).filter(x => x !== '')
const isTextNode = html => html.indexOf('="') === -1 && html.indexOf('<') === -1 && html.indexOf('>') === -1
const isCloseElement = element => element.indexOf('</') !== -1
const isOpenElement = element => element.indexOf('<') !== -1 && element.indexOf('/>') === -1 && element.indexOf('</') === -1
const isSelfCloseElement = element => element.indexOf('/>') !== -1
const hasProp = html => html.indexOf('="') !== -1 

const isComponent = element => element !== null && /(<[A-Z])/.test(element)
const hasComponent = html => /(<[A-Z])/.test(html)
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

function reconcile(root) {
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
const hasDynamicChildren = part => Array.isArray(part) && part[0].type !== undefined

export const createTree = fragment => {
  const rootElement = { type: 'root', props: { children: [] } }
  const stack = [rootElement]
  console.log('started createTree', {fragment, stack})
  fragment.statics.forEach((staticPart, index) => {
    let dynamicPart = fragment.dynamics[index]
    console.log('createTree', {fragment, staticPart, dynamicPart})
    const html = getHtml(staticPart)
    let htmlIndex = 0
    while (htmlIndex < html.length) {
      const htmlPart = html[htmlIndex++]
      let parent = stack[stack.length - 1]
      const isLastElement = htmlIndex === html.length
      const isDynamicTextNode = typeof dynamicPart === 'string' || typeof dynamicPart === 'number'

      let node
      console.log('htmlPart', htmlPart, {parent})
      if (isCloseElement(htmlPart)) {
        console.log('closing', htmlPart, stack.length, parent)
        console.log(stack[stack.length-1])
        stack.pop()
        console.log(stack[stack.length-1])
        console.log(stack[stack.length-2])
        parent = stack[stack.length - 1]
        console.log('closing new parent', parent)
      }
      else if (isSelfCloseElement(htmlPart) || isTextNode(htmlPart)) {
        console.log('self-closing or text node', htmlPart)
        node = createNode(htmlPart, fragment.components)
        parent.props.children.push(node)
      }
      else if (isOpenElement(htmlPart)) {
        console.log('opening', htmlPart, parent)
        node = createNode(htmlPart, fragment.components)
        parent.props.children.push(node)
        stack.push(node)
      }

      if (hasProp(htmlPart)) {
        const props = getProps(htmlPart, dynamicPart)
        console.log({props, node})
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
        console.log('hasDynamicCHildren', htmlPart)
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
        console.log('adding', dynamicPart, 'as next static')
        html.splice(htmlIndex, 0, String(dynamicPart)) // insert it as next htmlPart to process
        dynamicPart = undefined // reset dynamicPart as we're about to process it as the next htmlPart
      }
    }
  })
  console.log('finished createTree', {fragment, stack})
  return stack[0].props.children[0]
}

const render = (fragment, container) => {
  const root = reconcile(createTree(fragment))
  console.log('render', {root})
  const dom = createDom(root)
  container.appendChild(dom)
}
// console.log('tree', createTree(result))


const Ul = props => h`<ul>${props.children}</ul>`
const Li = props => h`<li>${props.children}</li>`
// const TodoApp = () => {}, TodoList = () => {}, Title = () => {}
const result = h`<Ul><b>${[1,2,3].map(x => h`<Li>${x}</Li>`(Li))}</b><h1>a</h1></Ul>`(Ul)
// const result = h`<ul><b>${[1,2,3].map(x => h`<li>${x}</li>`)}</b><h1>a</h1></ul>`
// const result = h`<button id="${1}" onclick="${e => console.log('hihi')}">Hey and ${'what'} up</button>`
// const result2 = h`<TodoApp><TodoList><Title>${'hello'}</Title></TodoList></TodoApp>`(TodoApp, TodoList,Title)
render(result, document.getElementById('app'))
