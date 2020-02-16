const ORDERED_NESTED_CHILDREN = {
  debug: '<ul>',
  type: 'ul',
  props: {
    children: [
      {
        debug: '<b>',
        type: 'b',
        props: {
          children: [
            {
              debug: '<li>',
              type: 'li',
              props: {
                children: [
                  {
                    debug: '1',
                    type: 'text',
                    props: {
                      children: [],
                      nodeValue: '1',
                    },
                  },
                ],
              },
            },
            {
              debug: '<li>',
              type: 'li',
              props: {
                children: [
                  {
                    debug: '2',
                    type: 'text',
                    props: {
                      children: [],
                      nodeValue: '2',
                    },
                  },
                ],
              },
            },
            {
              debug: '<li>',
              type: 'li',
              props: {
                children: [
                  {
                    debug: '3',
                    type: 'text',
                    props: {
                      children: [],
                      nodeValue: '3',
                    },
                  },
                ],
              },
            },
          ],
        },
      },
      {
        debug: '<h1>',
        type: 'h1',
        props: {
          children: [
            {
              debug: 'foo',
              type: 'text',
              props: {
                children: [],
                nodeValue: 'foo',
              },
            },
          ],
        },
      },
    ],
  },
}

const CHILD_COMPONENT = CustomH1 => ({
  debug: '<div>',
  type: 'div',
  props: {
    children: [
      {
        debug: '<CustomH1>',
        type: CustomH1,
        props: {
          children: [
            {
              debug: 'foo',
              type: 'text',
              props: {
                children: [],
                nodeValue: 'foo'
              }
            }
          ]
        }
      }
    ]
  }
})

const CHILD_COMPONENT_ARRAY = (CustomUl, CustomLi) => ({
    debug: '<CustomUl>',
    type: CustomUl,
    props: {
      children: [
        {
          debug: '<b>',
          type: 'b',
          props: {
            children: [
              {
                debug: '<CustomLi>',
                type: CustomLi,
                props: {
                  children: [
                    {
                      debug: '1',
                      type: 'text',
                      props: {
                        children: [],
                        nodeValue: '1'
                      }
                    }
                  ]
                }
              },
              {
                debug: '<CustomLi>',
                type: CustomLi,
                props: {
                  children: [
                    {
                      debug: '2',
                      type: 'text',
                      props: {
                        children: [],
                        nodeValue: '2'
                      }
                    }
                  ]
                }
              },
              {
                debug: '<CustomLi>',
                type: CustomLi,
                props: {
                  children: [
                    {
                      debug: '3',
                      type: 'text',
                      props: {
                        children: [],
                        nodeValue: '3'
                      }
                    }
                  ]
                }
              }
            ]
          }
        }
      ]
    }
  })

export {
  ORDERED_NESTED_CHILDREN,
  CHILD_COMPONENT,
  CHILD_COMPONENT_ARRAY
}