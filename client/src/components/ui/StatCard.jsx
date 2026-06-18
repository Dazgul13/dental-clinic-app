import React from 'react'
import PropTypes from 'prop-types'
import Card from './Card'
import { Link } from 'react-router-dom'

export default function StatCard({ icon, iconColor = 'teal', label, value, sub, subColor = 'muted', to }) {
  const content = (
    <Card className="bg-white p-4 rounded-lg shadow-sm">
      <div className="flex items-center gap-3">
        <i className={`bi ${icon}`} style={{ color: iconColor, fontSize: 24 }} />
        <div>
          <div className="text-sm text-gray-500">{label}</div>
          <div className="text-2xl font-semibold text-gray-900">{value}</div>
          {sub && <div className={`text-xs text-${subColor} mt-1`}>{sub}</div>}
        </div>
      </div>
    </Card>
  )

  if (to) {
    return <Link to={to}>{content}</Link>
  }

  return content
}

StatCard.propTypes = {
  icon: PropTypes.string,
  iconColor: PropTypes.string,
  label: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  sub: PropTypes.string,
  subColor: PropTypes.string,
}
