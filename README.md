# cork

## TDLR;
> React without JSX or a compile step. aka a runtime React. Don't use :) this is an unfinished experiment.

```javascript
import { render, html } from 'cork'

const Title = props => html`<div>${props.children}</div>`
const Button = props => {
  return html`
    <button onClick="${e => console.log('hi native events')}">
      ${props.children}
    </button>
  `
}

const App = props => {
  return html`
    <>
      <Title>:)</Title>
      <Button>Press me</Button>
    </>
  `(Title, Button)
}

render(html`<App/>`(App), document.getElementById('app'))

```
## Why?
For fun.


