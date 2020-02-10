import { createTree } from './create-tree.js'

const hasComponent = html => /(<[A-Z])/.test(html)

const expandTree = i => i
// const expandTree = (root) => {
//   const type = root.type
//   if (Array.isArray(root)) return root.map(expandTree)
//   const isHtmlElement = typeof type === 'string'

//   const component = isHtmlElement ? root : type(root.props)
//   if (component.props.children) {
//     component.props.children.forEach((child, idx) => {
//       if (child.type !== 'string') {
//         component.props.children[idx] = expandTree(component.props.children[idx])
//       }
//     })
//   }
//   return component
// }

// README: it is correctly loggin [Object object] because we've not build props handling into html`` yet :)
let depth = 0
const render = (root, container) => {
  depth++
  const element =
    root.type == 'text'
      ? document.createTextNode('')
      : document.createElement(root.type)
  
  root.ref = element
  const isProp = key => key !== 'children'
  const props = Object.keys(root.props).filter(isProp)
  props.forEach(name => element[name] = root.props[name])
  if (depth === 1) {
    console.log(123892183921839218, root)
    console.log(JSON.stringify(root, null, 2))
  }
  root.props.children.forEach(child => render(child, element))
  container.appendChild(element)
}

const toStatic = (statics, dynamics) => {
  console.log({statics, dynamics})
  let result = ''
  for (let [index, staticPart] of statics.entries()) {
    const dynamicPart = dynamics[index]
    result += staticPart
    if (dynamicPart) {
      console.log({dynamicPart})
      result += dynamicPart
    }
  }
  return result
}

const html = (statics, ...dynamics) => {
  const parsed = toStatic(statics, dynamics)
  if (!hasComponent(parsed)) return expandTree(createTree(parsed))
  return (...Components) => {
    const components = Components.reduce((factories, factory) => ({ ...factories, [factory.name]: factory } ), {})
    return expandTree(createTree(parsed, components))
  }
}

function Title (props) { return html`<h1>${props.children}</h1>` }

// const test = html`<div>hello</div>`
// const test2 = html`<div><h1>hihi</h1></div>`
const test2 = html`<div><Title>hihi</Title></div>`(Title)
// console.log(test)
console.log(test2)
render(test2, document.getElementById('app'))
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

/*
const TodoItem = props => html`<li>${props.todo.title}</li>`

const TodoList = props => {
  return html`
    <ul>
      ${props.todos.map(todo => html`<TodoItem todo="${todo}" />`(TodoItem))}
    </ul>`
}

const TodoFeature = props => {
  const todos = useState([])
  return html`
    <div>Todos</div>
    <TodoList list="${todos}" />
  `(TodoList)
}

const App = props => {
  return html`
    <div>App</div>
    <TodoFeature />
  `(TodoFeature)
}
*/