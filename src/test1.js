const elementRegex = /(<[^>]+>)/g
const getElements = str => str.split(elementRegex).filter(x => x !== '')
const isTextNode = element => element !== null && element.indexOf('<') === -1
const isCloseElement = element => element.indexOf('</') !== -1
const isOpenElement = element => (element.indexOf('<') !== -1 && (element.indexOf('<') !== -1 || element.indexOf(' ') !== -1)) && element.indexOf('/>') === -1
const isSelfCloseElement = element => element !== null && element.indexOf('/>') !== -1
const isComponent = element => element !== null && /(<[A-Z])/.test(element)
const hasComponent = html => /(<[A-Z])/.test(html)
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

const h = (statics, ...dynamics) => {
  if (!hasComponent(statics.join(''))) {
    return {
      type: 'fragment',
      statics,
      dynamics,
      components: null,
    }
  }
  return (...components) => {
    return {
      type: 'fragment',
      statics,
      dynamics,
      components: components.reduce((xs, x) => ({...xs, [x.name]: x }), {})
    }
  }
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
const getHtml = () => {}
const createTree = fragmentRoot => {
  // debugger
  const rootElement = { type: 'root', props: { children: [] } }
  const stack = [rootElement]
  console.log('fragmentRoot.static', fragmentRoot)
  fragmentRoot.statics.forEach((staticPart, partIndex) => {
    let dynamicPart = fragmentRoot.dynamics[partIndex]
    console.log({ staticPart, dynamicPart })
    let elementIndex = 0
    const elements = getElements(staticPart)
    while (elementIndex !== elements.length) {
      let parent = stack[stack.length - 1]
      const element = elements[elementIndex++]
      const isLastElement = elementIndex === elements.length
      let isDynamicTextNode = false
      let node
      console.log('element', element)
      if (isCloseElement(element)) {
        console.log('closing', element)
        stack.pop()
        parent = stack[stack.length - 1]
      }
      else if (isSelfCloseElement(element) || isTextNode(element)) {
        console.log('isSelfClose')
        node = createNode(element, fragmentRoot.components)
        parent.props.children.push(node)
      }
      else if (isOpenElement(element)) {
        console.log('isOpen')
        node = createNode(element, fragmentRoot.components)
        console.log('opening', element)
        console.log('dynamicPart', dynamicPart)
        parent.props.children.push(node)
        stack.push(node) 
      }
      console.log('narp')

      if (isLastElement && dynamicPart !== undefined) {
        if (hasDynamicChildren(dynamicPart)) {
          console.log('hasDynamicCHildren', element)
          dynamicPart.forEach(part => {
            if (part.type === 'fragment') { // our part could be fragment or it could be a tree... (reconciliation)
              node.props.children.push(createTree(part))
            }
            else { // our part could be fragment or it could be a tree... (reconciliation)
              node.props.children.push(part)
            }
          })
        }
        else if (isDynamicTextNode = typeof dynamicPart === 'string' || typeof dynamicPart === 'number') {
          elements.splice(elementIndex, 0, String(dynamicPart)) // insert it as next element to process
          dynamicPart = undefined // reset dynamicPart as we're about to process it as the next element
        }
      }
    }
  })
  console.log({fragmentRoot, stack})
  return stack[0].props.children[0]
}

const render = (fragment, container) => {
  const root = reconcile(createTree(fragment))
  console.log('render', {root})
  const dom = createDom(root)
  container.appendChild(dom)
}
// console.log('tree', createTree(result))


// const Ul = props => h`<ul>${props.children}</ul>`
// const Li = props => h`<li>${props.children}</li>`
// const TodoApp = () => {}, TodoList = () => {}, Title = () => {}
// const result = h`<Ul><b>${[1].map(x => h`<Li>${x}</Li>`(Li))}</b><h1>a</h1></Ul>`(Ul)
const result = h`<button id="${1}" onclick="${e => console.log('hihi')}">Hey what up</button>`
// const result2 = h`<TodoApp><TodoList><Title>${'hello'}</Title></TodoList></TodoApp>`(TodoApp, TodoList,Title)
render(result, document.getElementById('app'))
