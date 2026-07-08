import type { SVGProps } from 'react'

function Icon(props: SVGProps<SVGSVGElement>): JSX.Element {
  return (
    <svg
      viewBox="0 0 20 20"
      width={17}
      height={17}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="nav-icon"
      {...props}
    />
  )
}

export const DashboardIcon = (p: SVGProps<SVGSVGElement>): JSX.Element => (
  <Icon {...p}>
    <path d="M3 10.5 10 4l7 6.5" />
    <path d="M5 9v7h10V9" />
    <path d="M8 16v-4h4v4" />
  </Icon>
)

export const TransactionsIcon = (p: SVGProps<SVGSVGElement>): JSX.Element => (
  <Icon {...p}>
    <path d="M4 6h9" />
    <path d="M4 10h12" />
    <path d="M4 14h7" />
    <circle cx="16" cy="14" r="2.4" />
  </Icon>
)

export const CalendarIcon = (p: SVGProps<SVGSVGElement>): JSX.Element => (
  <Icon {...p}>
    <rect x="3.5" y="4.5" width="13" height="12" rx="2" />
    <path d="M3.5 8.5h13" />
    <path d="M7 3v3M13 3v3" />
  </Icon>
)

export const TargetIcon = (p: SVGProps<SVGSVGElement>): JSX.Element => (
  <Icon {...p}>
    <circle cx="10" cy="10" r="6.5" />
    <circle cx="10" cy="10" r="3.2" />
    <circle cx="10" cy="10" r="0.6" fill="currentColor" />
  </Icon>
)

export const TrendUpIcon = (p: SVGProps<SVGSVGElement>): JSX.Element => (
  <Icon {...p}>
    <path d="M4 13l4.5-5 3 3L16.5 5" />
    <path d="M12.5 5H16.5V9" />
  </Icon>
)

export const RefreshIcon = (p: SVGProps<SVGSVGElement>): JSX.Element => (
  <Icon {...p}>
    <path d="M16 6.5A6.5 6.5 0 1 0 17 10" />
    <path d="M16 3v4h-4" />
  </Icon>
)

export const ReportIcon = (p: SVGProps<SVGSVGElement>): JSX.Element => (
  <Icon {...p}>
    <path d="M6 3.5h6l3 3v10a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-12a1 1 0 0 1 1-1Z" />
    <path d="M7.5 10h5M7.5 13h5" />
  </Icon>
)

export const BackupIcon = (p: SVGProps<SVGSVGElement>): JSX.Element => (
  <Icon {...p}>
    <ellipse cx="10" cy="5.5" rx="6" ry="2.3" />
    <path d="M4 5.5V14c0 1.27 2.69 2.3 6 2.3s6-1.03 6-2.3V5.5" />
    <path d="M4 9.8c0 1.27 2.69 2.3 6 2.3s6-1.03 6-2.3" />
  </Icon>
)

export const PlusIcon = (p: SVGProps<SVGSVGElement>): JSX.Element => (
  <Icon {...p} strokeWidth={2}>
    <path d="M10 4v12M4 10h12" />
  </Icon>
)

export const ChevronLeftIcon = (p: SVGProps<SVGSVGElement>): JSX.Element => (
  <Icon {...p} strokeWidth={2}>
    <path d="M12 4.5 6.5 10l5.5 5.5" />
  </Icon>
)

export const ChevronRightIcon = (p: SVGProps<SVGSVGElement>): JSX.Element => (
  <Icon {...p} strokeWidth={2}>
    <path d="M8 4.5 13.5 10 8 15.5" />
  </Icon>
)

export const TrashIcon = (p: SVGProps<SVGSVGElement>): JSX.Element => (
  <Icon {...p}>
    <path d="M4.5 6h11" />
    <path d="M8 6V4.5h4V6" />
    <path d="M6 6l.6 9.4a1 1 0 0 0 1 .93h4.8a1 1 0 0 0 1-.93L14 6" />
  </Icon>
)

export const EditIcon = (p: SVGProps<SVGSVGElement>): JSX.Element => (
  <Icon {...p}>
    <path d="M12.5 3.5 16 7l-8.5 8.5H4v-3.5Z" />
  </Icon>
)

export const HistoryIcon = (p: SVGProps<SVGSVGElement>): JSX.Element => (
  <Icon {...p}>
    <circle cx="10" cy="10.5" r="6.5" />
    <path d="M10 7v3.5l2.5 1.5" />
    <path d="M4 4v3h3" />
  </Icon>
)

export const UploadIcon = (p: SVGProps<SVGSVGElement>): JSX.Element => (
  <Icon {...p}>
    <path d="M10 13V4M6.5 7.5 10 4l3.5 3.5" />
    <path d="M4 14v1.5a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V14" />
  </Icon>
)
