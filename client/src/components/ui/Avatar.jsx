import React from 'react'
import PropTypes from 'prop-types'

export default function Avatar({ initials, size = 'default', variant = 'primary' }) {
  const sizes = { sm: 28, default: 40, lg: 56 }
  const px = sizes[size] || sizes.default
  const style = {
    width: px,
    height: px,
    borderRadius: '50%',
    background: `var(--${variant})` || 'var(--primary)',
    color: 'white',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
  }
  return <div className="pd-avatar" style={style}>{initials}</div>
}

Avatar.propTypes = {
  initials: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'default', 'lg']),
  variant: PropTypes.oneOf(['primary', 'accent']),
}
