'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const GRADES = [
  { grade: 10, label: 'Lớp 10', color: 'var(--grade-10)' },
  { grade: 11, label: 'Lớp 11', color: 'var(--grade-11)' },
  { grade: 12, label: 'Lớp 12', color: 'var(--grade-12)' },
];

export default function Navbar() {
  const pathname = usePathname();

  // Extract current grade from URL
  const gradeMatch = pathname.match(/\/lop\/(\d+)/);
  const currentGrade = gradeMatch ? parseInt(gradeMatch[1]) : null;

  return (
    <nav className="navbar">
      <Link href="/" className="navbar-logo">
        <span className="logo-icon">📐</span>
        <span>PTex Mô Phỏng</span>
      </Link>

      <div className="grade-selector">
        {GRADES.map(({ grade, label }) => (
          <Link
            key={grade}
            href={`/lop/${grade}`}
            className={`grade-btn ${currentGrade === grade ? 'active' : ''}`}
            data-grade={grade}
          >
            {label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
