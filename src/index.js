import { createTree } from './create-tree.js'
import { internal } from './internal.js'

const hasComponent = html => /(<[A-Z])/.test(html)

let depth = 0
const render = (root, container) => {
  depth++
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

  if (depth === 1) {
    console.log('render', JSON.stringify(root, null, 2), root)
  }
  root.props.children.forEach(child => render(child, domElement))
  container.appendChild(domElement)
}
internal.refs = {}
internal.refIndex = 0

const toStatic = (statics, dynamics) => {
  console.log('toStatic', {statics, dynamics})
  let result = ''
  for (let [index, staticPart] of statics.entries()) {
    const dynamicPart = dynamics[index]
    result += staticPart
    
    if (staticPart.endsWith('="')) {
      console.log('toStatic', 'dynamic prop', {staticPart, dynamicPart})
      const propIndex = internal.addProp(dynamicPart)
      result += `props[${propIndex}]`
    }
    else if (typeof dynamicPart === 'string' || typeof dynamicPart === 'number') {
      console.log('toStatic', 'dynamic content:', {staticPart, dynamicPart})
      result += dynamicPart
    }
    else if (Array.isArray(dynamicPart)) {
      console.log('storing dynamicPart for later', dynamicPart)
      internal.refs[++internal.refIndex] = dynamicPart
      result += `refs[${internal.refIndex}]`
    }
  }
  console.log({result})
  return result
}

const html = (statics, ...dynamics) => {
  const parsed = toStatic(statics, dynamics)
  console.log('html', parsed, hasComponent(parsed))
  if (!hasComponent(parsed)) return createTree(parsed)
  return (...Components) => {
    const components = Components.reduce((factories, factory) => ({ ...factories, [factory.name]: factory } ), {})
    console.log('html', {components})
    return createTree(parsed, components)
  }
}

// function Title (props) { return html`<h1>${props.children}</h1>` }
function Title2 (props) { return html`<h1 onClick="${() => console.log(123)}" id="a" id2="asdf">${props.title}</h1>` }

// const test = html`<div>hello</div>`
// const test2 = html`<div><h1>hihi</h1></div>`
// const test2 = html`<div><Title2 title="${'heyt'}" /></div>`(Title2)
// const test3 = html`<div><Title><b>bb</b><Title2 title="hihi" /></Title></div>`(Title, Title2)
// const test = html`<ul>${[1,2,3].map(x => html`<li>${x}</li>`)}</ul>`
// console.log(test)
// console.log(test3)
// render(test, document.getElementById('app'))
/*
`<div><Title>hello</Title></div>`
---
html()
->
createTree()
{
  "type": "div",
  "props": {
    "children": [
      {
        "type": Title,
        "props": {
          "children": [
            {
              "type": "text",
              "props": {
                "nodeValue": "hihi",
                "children": []
              }
            }
          ]
        }
      }
    ]
  }
}
expandTree()
{
  "type": "div",
  "props": {
    "children": [
      {
        "type": "h1",
        "props": {
          "children": [
            {
              "type": "text",
              "props": {
                "nodeValue": "hihi",
                "children": []
              }
            }
          ]
        }
      }
      }
    ]
  }
}
---
tree[0].appendChild(tree[0].children[0...])
---
*/

const TodoItem = props => {
  console.log('TodoItem', props)
  return html`<li>${props.todo.title}</li>`
}

const TodoList = props => {
  console.log('TodoList', props)
  return html`
    <ul>
      ${props.todos.map(todo => html`<TodoItem todo="${todo}" />`(TodoItem))}
    </ul>`
}

const TodoFeature = props => {
  const todos = [{title: 'test123'}]
  // const todos = useState([])
  return html`
    <div>
      <div>Todos</div>
      <TodoList todos="${todos}" />
    </div>
  `(TodoList)
}

const App = props => {
  return html`
    <div>
      <div>AppTitle</div>
      <TodoFeature />
    </div>
  `(TodoFeature)
}

render(html`<App />`(App), document.getElementById('app'))
