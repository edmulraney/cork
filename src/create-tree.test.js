import { html } from './html'
import { createTree } from './create-tree'
import * as mocks from './create-tree.test.expectations'

const debug = tree => console.log(JSON.stringify(tree, null, 2))
// TODO: make these snapshots instead so you dont have to store expectations

describe('createTree', () => {
  it('prevents single nested child fragments', () => {
    // we dont want devs to nest inline html declarations, they should be declared as one fragment
    const spec = html`
      <div>
        ${html`<h1>Hello</h1>`}
      </div>
    `
    const result = createTree(spec)
    expect(result).toMatchSnapshot()
  })

  it('handles correct ordering of nested children', () => {
    const spec = html`
      <ul>
        <b>${[1, 2, 3].map(x => html`<li>${x}</li>`)}</b>
        <h1>foo</h1>
      </ul>
    `

    const result = createTree(spec)
    expect(result).toMatchSnapshot()
  })

  it('handles child component', () => {
    const CustomH1 = props => html`<h1>${props.children}</h1>`
    const spec = html`
      <div>
        <CustomH1>foo</CustomH1>
      </div>`(CustomH1)
    const result = createTree(spec)
    expect(result).toMatchSnapshot()
  })

  it('handles child component array', () => {
    const CustomUl = props => html`<ul>${props.children}</ul>`
    const CustomLi = props => html`<li>${props.children}</li>`
    const spec = html`
      <CustomUl>
        <b>${[1, 2, 3].map(x => html`<CustomLi>${x}</CustomLi>`(CustomLi))}</b>
      </CustomUl>`(CustomUl)
    const result = createTree(spec)
    expect(result).toMatchSnapshot()
  })

  it('handles dynamic element props', () => {
    const onClick = e => onClick('foo')
    const spec = html`<button id="${1}" onclick="${onClick}">Foo and ${'bar'} :)</button>`
    const result = createTree(spec)
    expect(result).toMatchSnapshot()
  })

  it('handles static element props', () => {})

  it('handles static and dynamic element props', () => {})

  it('handles static component props', () => {})

  it('handles dynamic component props', () => {})

  it('handles static and dynamic component props', () => {})


})
