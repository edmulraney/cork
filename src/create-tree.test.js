import { html } from './html'
import { createTree } from './create-tree'

describe('createTree', () => {
  it('handles child fragment', () => {
    const spec = html`<div>${html`<h1>Hello</h1>`}</div>`
    const result = createTree(spec)
    const expected = {}
    expect(result).toBe(expected)
  })
})