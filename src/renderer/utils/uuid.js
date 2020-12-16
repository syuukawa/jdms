import {random} from 'lodash'

const RFC4122_TEMPLATE = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'

function replacePlaceholders (placeholder) {
  let value = random(15)
  value = placeholder === 'x' ? value : (value & 0x3 | 0x8)
  return value.toString(16)
}

export default () => {
  return RFC4122_TEMPLATE.replace(/[xy]/g, replacePlaceholders)
}