const hasComponent = html => /(<[A-Z])/.test(html)
const html = (statics, ...dynamics) => {
  if (!hasComponent(statics.join(''))) {
    return {
      type: 'fragment',
      statics,
      dynamics,
      components: null,
    }
  }
  return (...components) => {
    return {
      type: 'fragment',
      statics,
      dynamics,
      components: components.reduce((xs, x) => ({...xs, [x.name]: x }), {})
    }
  }
}

export {
  html,
}