const STARS = [1, 2, 3, 4, 5];

function StarRating({ value = 0, onRate, size = 'medium', label = 'Valoración' }) {
  const isInteractive = typeof onRate === 'function';
  const clampedValue = Number.isFinite(value) ? Math.max(0, Math.min(5, value)) : 0;

  return (
    <div
      className={`star-rating star-rating--${size}${isInteractive ? ' is-interactive' : ''}`}
      role={isInteractive ? 'radiogroup' : 'img'}
      aria-label={label}
    >
      {STARS.map((star) => {
        const isActive = clampedValue >= star - 0.25;
        if (isInteractive) {
          return (
            <button
              key={star}
              type="button"
              className={`star-rating__star${isActive ? ' is-active' : ''}`}
              onClick={() => onRate(star)}
              role="radio"
              aria-checked={Math.round(clampedValue) === star}
              aria-label={`${star} ${star === 1 ? 'estrella' : 'estrellas'}`}
            >
              <span aria-hidden="true">★</span>
            </button>
          );
        }

        return (
          <span key={star} className={`star-rating__star${isActive ? ' is-active' : ''}`} aria-hidden="true">
            ★
          </span>
        );
      })}
    </div>
  );
}

export default StarRating;
