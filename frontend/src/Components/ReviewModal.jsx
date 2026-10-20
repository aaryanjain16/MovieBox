
function ReviewModal({
    movie,
    setRating,
    review,
    rating,
    setReview,
    saveReview,
    closeModal
}) {
    return (
        <div className="modal-overlay" onClick={closeModal}>
            <div
                className="review-modal"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    className="review-close-icon"
                    onClick={closeModal}
                    aria-label="Close review"
                >
                    ×
                </button>

                <h2>Write a Review</h2>

                <p className="review-movie-title">
                    {movie.Title || movie.title}
                </p>

                <p className="rating-label">Your Rating</p>

                <div className="rating-stars">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <span
                            key={star}
                            onClick={() => setRating(star)}
                            role="button"
                            tabIndex={0}
                            aria-label={`${star} star${star > 1 ? "s" : ""}`}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault();
                                    setRating(star);
                                }
                            }}
                            className={
                                star <= Number(rating)
                                    ? "star selected"
                                    : "star"
                            }
                        >
                            {star <= Number(rating) ? "★" : "☆"}
                        </span>
                    ))}
                </div>

                <textarea
                    className="review-textarea"
                    placeholder="What did you think of this movie?"
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    rows={4}
                />

                <div className="modal-actions">
                    <button
                        className="save-review-btn"
                        onClick={saveReview}
                        disabled={!rating}
                    >
                        Save Review
                    </button>

                    <button
                        className="close-review-btn"
                        onClick={closeModal}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ReviewModal;
