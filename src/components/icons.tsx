interface IconProps {
    size?: number;
    className?: string;
}

/** User with a plus — used for "add player" / "add profile" actions. */
export const IconUserPlus = ({ size = 24, className }: IconProps) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
    >
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <line x1="19" y1="8" x2="19" y2="14" />
        <line x1="22" y1="11" x2="16" y2="11" />
    </svg>
);

/** Person inside a circle — used as a default avatar placeholder. */
export const IconUserCircle = ({ size = 24, className }: IconProps) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
    >
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="10" r="3.2" />
        <path d="M6.5 19a6 6 0 0 1 11 0" />
    </svg>
);

/** Clock — unit marker next to an "hours" input. */
export const IconClock = ({ size = 24, className }: IconProps) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
    >
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3.5 2" />
    </svg>
);
