import { createTree } from './create-tree.js'

const render = (root, container) => {
  const element =
    root.type == 'text'
      ? document.createTextNode('')
      : document.createElement(root.type)
  
  root.ref = element
  const isProp = key => key !== 'children'
  const props = Object.keys(root.props).filter(isProp)
  props.forEach(name => element[name] = root.props[name])
  console.log(element)
  root.children.forEach(child => render(child, element))
  container.appendChild(element)
}

const hasComponent = () => false
const toStatic = (statics, dynamics) => {
  let result = ''
  for (let [index, staticPart] of statics.entries()) {
    const dynamicPart = dynamics[index]
    result += staticPart
    if (dynamicPart) result += dynamicPart
  }
  return result
}

const html = (statics, ...dynamics) => {
  const parsed = toStatic(statics, dynamics)
  if (!hasComponent(parsed)) return createTree(parsed)
  return (...Components) => {
    const components = Components.reduce((factories, factory) => ({ ...factories, [factory.name]: factory } ), {})
    return createTree(parsed, components)
  }
}

const test = html`<div>hello</div>`
console.log(test)
render(test, document.getElementById('app'))
/*
`<div>hello</div>`
---
{
  type: 'div',
  ref: document.createElement('div'),
  props: {},
  children: {
    type: '',
    ref: document.createTextNode(''),
    props: {
      nodeValue: 'hello'
    },
  }
}
---
tree[0].appendChild(tree[0].children[0...])
---
*/


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
