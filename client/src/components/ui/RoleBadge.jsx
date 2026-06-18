import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import Badge from 'react-bootstrap/Badge'
import { useLocation } from 'react-router-dom'

export default function RoleBadge({ role }) {
  const location = useLocation()

  useEffect(() => {
    if (role === 'sysadmin' && location.pathname.startsWith('/')) {
      // warn at dev-time if sysadmin appears in normal app pages
      // Only a soft console warning
      if (!location.pathname.startsWith('/sys-admin')) {
        console.warn('RoleBadge: rendering sysadmin role outside Control Center paths')
      }
    }
  }, [role, location])

  return <Badge bg="secondary" className={`pd-role pd-role--${role}`}>{role}</Badge>
}

RoleBadge.propTypes = {
  role: PropTypes.oneOf(['admin', 'dentist', 'reception', 'sysadmin']).isRequired,
}
