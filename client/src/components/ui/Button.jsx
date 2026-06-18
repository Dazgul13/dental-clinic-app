import React from 'react'
import PropTypes from 'prop-types'
import RBButton from 'react-bootstrap/Button'

/**
 * Button wrapper mapping PearlDesk variants to stable classes.
 */
export default function Button({ variant = 'primary', size = 'default', children, ...rest }) {
  const vClass = `pd-btn pd-btn--${variant}`
  const bsSize = size === 'sm' ? 'sm' : undefined
  return (
    <RBButton className={vClass} size={bsSize} {...rest}>
      {children}
    </RBButton>
  )
}

Button.propTypes = {
  variant: PropTypes.oneOf(['primary', 'accent', 'outline', 'ghost', 'danger']),
  size: PropTypes.oneOf(['default', 'sm']),
  children: PropTypes.node,
}
