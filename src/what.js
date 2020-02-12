import { createTree } from './create-tree.1.js'
import { internal } from './internal.js'

const hasComponent = html => /(<[A-Z])/.test(html)

const render = (rootFragment, container) => {
  console.log({rootFragment})
  const tree = finalTree(rootFragment)
  console.log({tree})
}

const finalTree = fragment => {
  // debugger
  if (fragment.children) {
    Object.keys(fragment.children).map(index => {
      const child = fragment.children[index]
      console.log({child})
      return child.map(finalTree)
    })
  }
  fragment.tree = createTree(fragment, fragment.components)

  return fragment.html
}

const getFragment = (statics, dynamics, Components) => {
  const fragment = { html: '', children: {}, components: {}, childIndex: 0 }
  for (let [index, staticPart] of statics.entries()) {
    const dynamicPart = dynamics[index]
    fragment.html += staticPart
    
    if (Components !== undefined) {
      fragment.components = Components.reduce((components, component) => ({ ...components, [component.name]: component } ), {})
    }
    
    if (staticPart.endsWith('="')) {
      console.log('toStatic', 'dynamic prop', {staticPart, dynamicPart})
      const propIndex = internal.addProp(dynamicPart)
      fragment.html += `props[${propIndex}]`
    }
    else if (typeof dynamicPart === 'string' || typeof dynamicPart === 'number') {
      console.log('toStatic', 'dynamic content:', {staticPart, dynamicPart})
      fragment.html += dynamicPart
    }
    else if (Array.isArray(dynamicPart) && Components === undefined) { // array of html elemnets
      console.log('getFragment non comp', dynamicPart)
      fragment.children[++fragment.childIndex] = dynamicPart
      fragment.html += `children[${fragment.childIndex}]`
    }

  }
  console.log('getFragment', {fragment })
  return fragment
}

const html = (statics, ...dynamics) => {
  if (hasComponent(statics)) {
    console.log('GOT COMPS')
    return (...Components) => getFragment(statics, dynamics, Components)
  }
  return getFragment(statics, dynamics)
}


// function Title (props) { return html`<h1>${props.children}</h1>` }
// function Title2 (props) { return html`<h1 onClick="${() => console.log(123)}" id="a" id2="asdf">${props.title}</h1>` }

// const test = html`<div>hello</div>`
// const test2 = html`<div><h1>hihi</h1></div>`
// const test2 = html`<div><Title2 title="${'heyt'}" /></div>`(Title2)
// const test3 = html`<div><Title><b>bb</b><Title2 title="hihi" /></Title></div>`(Title, Title2)
// const test = html`<ul>${[1,2,3].map(x => html`<li>${x}</li>`)}</ul>`

const B = props => html`<b>${props.children}</b>`
const Li = props => html`<B>${props.children}</B>`(B)
const test = html`<ul>${[1,2,3].map(x => html`<Li>${x}</Li>`(Li))}</ul>`
// console.log(test)
// console.log(test3)
render(test, document.getElementById('app'))
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

// const TodoItem = props => {
//   console.log('TodoItem', props)
//   return html`<li>${props.todo.title}</li>`
// }

// const TodoList = props => {
//   console.log('TodoList', props)
//   return html`
//     <ul>
//       ${props.todos.map(todo => html`<TodoItem todo="${todo}" />`(TodoItem))}
//     </ul>`
// }

// const TodoFeature = props => {
//   const todos = [{title: 'test123'}]
//   // const todos = useState([])
//   return html`
//     <div>
//       <div>Todos</div>
//       <TodoList todos="${todos}" />
//     </div>
//   `(TodoList)
// }

// const App = props => {
//   return html`
//     <div>
//       <div>AppTitle</div>
//       <TodoFeature />
//     </div>
//   `(TodoFeature)
// }

// render(html`<App />`(App), document.getElementById('app'))
