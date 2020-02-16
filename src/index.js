import { html } from './html.js'
import { render } from './dom.js'

// const Ul = props => html`<ul>${props.children}</ul>`
// const Li = props => html`<li>${props.children}</li>`
// const TodoApp = () => {}, TodoList = () => {}, Title = () => {}
// const result = html`<Ul><b>${[1,2,3].map(x => html`<Li>${x}</Li>`(Li))}</b><h1>a</h1></Ul>`(Ul)
// const result = html`<ul><b>${[1,2,3].map(x => html`<li>${x}</li>`)}</b><h1>foo</h1></ul>`
// const result = html`<ul>
// <b>${[1, 2, 3].map(x => html`<li>${x}</li>`)}</b>
// <h1>foo</h1>
// </ul>`
// const result = html`<ul><b>${[1,2,3].map(x => html`<li>${x}</li>`)}</b><h1>a</h1></ul>`
// // const result = html`<button id="${1}" onclick="${e => console.log('hihi')}">Hey and ${'what'} up</button>`
// // const result2 = html`<TodoApp><TodoList><Title>${'hello'}</Title></TodoList></TodoApp>`(TodoApp, TodoList,Title)

// const CustomH1 = props => html`<h1>${props.children}</h1>`
// const spec = html`
//   <div>
//     <CustomH1>foo</CustomH1>
//   </div>`(CustomH1)
// const spec = html`<button id="${1}" onclick="${e => onClick('foo')}">Foo and ${'bar'} :)</button>`

const TodoItem = props => {
  return html`<li>${props.todo.title}</li>`
}

const TodoList = props => {
  props.todos = [{title: 'todo1'}]
  return html`
    <ul>
      ${props.todos.map(todo => html`<TodoItem todo="${todo}" />`(TodoItem))}
    </ul>`
}

const TodoFeature = props => {
  const todos = [{title: 'test123'}]
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
render(html`<App/>`(App), document.getElementById('app'))
