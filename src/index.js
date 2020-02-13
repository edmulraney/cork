import { createTree } from './create-tree.js'
import { internal } from './internal.js'

const hasComponent = html => /(<[A-Z])/.test(html)

let depth = 0

function reconcile(root) {
  const type = root.type
  if (Array.isArray(root)) {
    return root.map((child) = reconcile(child))
  }
    console.log(root, type)
  const Comp = typeof type === 'string' ? root : type(root.props)
  if (Comp.props && Comp.props.children) {
    Comp.props.children.forEach((child, idx) => {
      if (typeof child.type !== 'string') {
        Comp.props.children[idx] = reconcile(Comp.props.children[idx])
      }
    })
  }
  return Comp
}

const render = (root1, container) => {
  depth++
  console.log('render', root1)
  // debugger
  const tree = depth === 1 ? createTree(root1) : root1
  // debugger
  console.log('render tree', tree)
  const root = reconcile(tree)
  // const root =tree

  // if (typeof root.type === 'function') {
  //   console.log('RENDERING COMPONENT')
  //   // const cx = (root.type(root.props))
  //   // console.log({cx})
  //   // return render(cx, container)
  //   root = root.type(root.props)
  // }
  console.log('past root type', root)
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

const toStatic = (statics, dynamics) => {
  console.log('toStatic', {statics, dynamics})
  let result = ''
  for (let [index, staticPart] of statics.entries()) {
    const dynamicPart = dynamics[index]
    result += staticPart
    
    // if (Array.isArray(dynamicPart)) { 
    //   console.log('ISARRAY')
    //   if ( typeof dynamicPart.type === 'function') {
    //   console.log('TYPEIT')

    //     result += dynamicPart.map(dynamicPat.type(dynamicPart.props))
    //   }
    // }

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
      result += dynamicPart.join('')
    }
  }
  console.log({result})
  return result
}

const html = (statics, ...dynamics) => {
  const parsed = toStatic(statics, dynamics)
  console.log('html', parsed, hasComponent(parsed))
  return (parsed)
}

const html2 = (statics, ...dynamics) => (...Components) => {
  const parsed = toStatic(statics, dynamics)
  const components = Components.reduce((factories, factory) => ({ ...factories, [factory.name]: factory } ), {})
  console.log('html2', {components})
  return createTree(parsed, components)
}

// function Title (props) { return html`<h1>${props.children}</h1>` }
// function Title2 (props) { return html`<h1 onClick="${() => console.log(123)}" id="a" id2="asdf">${props.title}</h1>` }

const test = html`<ul>${[1,2,3].map(x => html`<li>${x}</li>`)}</ul>`
// console.log(test)
render(test, document.getElementById('app'))

// const TodoItem = props => {
//   console.log('TodoItem', props)
//   return html`<li>${props.todo.title}</li>`
// }

// const TodoList = props => {
//   console.log('TodoList', props)
//   return html2`
//     <ul>
//       ${props.todos.map(todo => html2`<TodoItem todo="${todo}" />`(TodoItem))}
//     </ul>`
// }

// const TodoFeature = props => {
//   const todos = [{title: 'test123'}]
//   // const todos = useState([])
//   return html2`
//     <div>
//       <div>Todos</div>
//       <TodoList todos="${todos}" />
//     </div>
//   `(TodoList)
// }

// const App = props => {
//   return html2`
//     <div>
//       <div>AppTitle</div>
//       <TodoFeature />
//     </div>
//   `(TodoFeature)
// }

// render(html2`<App />`(App), document.getElementById('app'))