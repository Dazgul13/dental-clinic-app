import React from 'react'
import Button from '../components/ui/Button'
import StatusBadge from '../components/ui/StatusBadge'
import RoleBadge from '../components/ui/RoleBadge'
import Card from '../components/ui/Card'
import StatCard from '../components/ui/StatCard'
import Avatar from '../components/ui/Avatar'
import EmptyState from '../components/ui/EmptyState'
import LoadingSkeleton from '../components/ui/LoadingSkeleton'
import ErrorState from '../components/ui/ErrorState'
import NoResultsState from '../components/ui/NoResultsState'

function DevOnly({ children }) {
  if (import.meta.env.MODE === 'production') return <div>Not available</div>
  return children
}

export default function ComponentLibrary() {
  return (
    <DevOnly>
      <div className="p-4">
        <h2>Component Library</h2>
        <section className="mt-4">
          <h3>Buttons</h3>
          <div className="d-flex gap-2">
            <Button variant="primary">Primary</Button>
            <Button variant="accent">Accent</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="danger">Danger</Button>
          </div>
        </section>

        <section className="mt-4">
          <h3>Badges</h3>
          <StatusBadge status="success">Active</StatusBadge>
          <StatusBadge status="warning">Pending</StatusBadge>
          <RoleBadge role="admin" />
        </section>

        <section className="mt-4">
          <h3>Cards & Stat</h3>
          <Card>
            <div>Example card content</div>
          </Card>
          <StatCard icon="bi-calendar-check" label="Today's Appointments" value="14" sub="↑ 2 vs yesterday" subColor="success" />
        </section>

        <section className="mt-4">
          <h3>Avatars & States</h3>
          <Avatar initials="ML" />
          <EmptyState message="No patients yet" actionLabel="+ Add your first patient" onAction={() => {}} />
          <LoadingSkeleton rows={4} />
          <ErrorState message="Couldn't load patients. Check your connection and retry." onRetry={() => {}} />
          <NoResultsState query="john" onClear={() => {}} />
        </section>
      </div>
    </DevOnly>
  )
}
