import { createTree } from './create-tree.1.js'
import { internal } from './internal.js'

const hasComponent = html => /(<[A-Z])/.test(html)

const html = (statics, ...dynamics) => {
  if (hasComponent(statics)) {
    console.log('GOT COMPS')
    return (...Components) => getFragment(statics, dynamics, Components)
  }
  return getFragment(statics, dynamics)
}

const B = props => html`<b>${props.children}</b>`
const Li = props => html`<li><B>${props.children}</B></li>`(B)
const test = html`<ul>${[1,2,3].map(x => html`<Li>${x}</Li>`(Li))}</ul>`
render(test, document.getElementById('app'))


/*
<ul>
  props = { children: 1}
  Li(props)
</ul>
*/


/////
/*
<ul>
  <Li>1</Li>
  <Li>2</Li>
  <Li>3</Li>
</ul>
*/

/*
<ul>
  <li><B>1</B></li>
  <li><B>2</B></li>
  <li><B>3</B></li>
</ul>
*/

/*
<ul>
  <li><b>1</b></li>
  <li><b>2</b></li>
  <li><b>3</b></li>
</ul>
*/

