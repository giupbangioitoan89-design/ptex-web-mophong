'use client';

import { useEffect, useRef } from 'react';
import katex from 'katex';

interface MathRendererProps {
  /** LaTeX string — can contain inline $...$ and display $$...$$ */
  content: string;
  /** If true, render as display math (centered, large) */
  displayMode?: boolean;
  /** Additional CSS class */
  className?: string;
}

/**
 * Parse text and render all LaTeX expressions with KaTeX.
 * Supports:
 *   - Pure LaTeX: "f(x) = x^2 + 1" → rendered as single formula
 *   - Mixed text with inline: "Hàm $f(x) = x^2$ có đạo hàm $f'(x) = 2x$"
 *   - Display math: "$$\\int_0^1 x^2 dx = \\frac{1}{3}$$"
 */
export default function MathRenderer({ content, displayMode, className }: MathRendererProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current || !content) return;

    // Normalize double backslashes to single backslashes for KaTeX compatibility
    const normalizedContent = content
      .replace(/\\\\([a-zA-Z_,;!$#%&^`~|'":?*+=\-\[\]\(\)\{\}<>])/g, '\\$1')
      .replace(/\\\\ /g, '\\ ');

    // If displayMode is explicitly set, render entire content as one formula
    if (displayMode !== undefined) {
      try {
        katex.render(normalizedContent, ref.current, {
          displayMode,
          throwOnError: false,
          trust: true,
          strict: false,
        });
      } catch {
        ref.current.textContent = normalizedContent;
      }
      return;
    }

    // Auto-detect: if content has $ delimiters, parse mixed text+math
    if (normalizedContent.includes('$')) {
      ref.current.innerHTML = renderMixedContent(normalizedContent);
      return;
    }

    // No $ delimiters: try to render as pure LaTeX
    // If it looks like LaTeX (has \, ^, _, {, }), render it
    if (/[\\^_{}]/.test(normalizedContent)) {
      try {
        katex.render(normalizedContent, ref.current, {
          displayMode: false,
          throwOnError: false,
          trust: true,
          strict: false,
        });
      } catch {
        ref.current.textContent = normalizedContent;
      }
      return;
    }

    // Plain text — just display as-is
    ref.current.textContent = normalizedContent;
  }, [content, displayMode]);

  return <span ref={ref} className={className} />;
}

/**
 * Parse mixed text with $inline$ and $$display$$ math.
 */
function renderMixedContent(text: string): string {
  const parts: string[] = [];
  let i = 0;

  while (i < text.length) {
    // Display math: $$...$$
    if (text[i] === '$' && text[i + 1] === '$') {
      const end = text.indexOf('$$', i + 2);
      if (end !== -1) {
        const latex = text.slice(i + 2, end);
        try {
          parts.push(katex.renderToString(latex, {
            displayMode: true,
            throwOnError: false,
            trust: true,
            strict: false,
          }));
        } catch {
          parts.push(`<span class="katex-error">${escapeHtml(latex)}</span>`);
        }
        i = end + 2;
        continue;
      }
    }

    // Inline math: $...$
    if (text[i] === '$') {
      const end = text.indexOf('$', i + 1);
      if (end !== -1) {
        const latex = text.slice(i + 1, end);
        try {
          parts.push(katex.renderToString(latex, {
            displayMode: false,
            throwOnError: false,
            trust: true,
            strict: false,
          }));
        } catch {
          parts.push(`<span class="katex-error">${escapeHtml(latex)}</span>`);
        }
        i = end + 1;
        continue;
      }
    }

    // Regular text
    let next = text.indexOf('$', i + 1);
    if (next === -1) next = text.length;
    parts.push(escapeHtml(text.slice(i, next)));
    i = next;
  }

  return parts.join('');
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Inline component for rendering a single LaTeX formula inline in text.
 */
export function InlineMath({ children }: { children: string }) {
  return <MathRenderer content={children} displayMode={false} />;
}

/**
 * Block component for rendering a display-mode formula (centered, large).
 */
export function DisplayMath({ children, className }: { children: string; className?: string }) {
  return <MathRenderer content={children} displayMode={true} className={className} />;
}

/**
 * Smart renderer: auto-detects $inline$ and $$display$$ in mixed text.
 * Perfect for rendering keyInsights, explanations, etc.
 */
export function MathText({ children, className }: { children: string; className?: string }) {
  return <MathRenderer content={children} className={className} />;
}
